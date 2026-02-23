import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { ENV } from '@/configs/env';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';

/** Re-verify the user against the DB every 5 minutes inside the jwt callback.
 * Catches deletions/suspensions without requiring a new sign-in.
 * Adjust lower for tighter security at the cost of more DB queries. */
const DB_CHECK_INTERVAL_MS = 5 * 60 * 1000;

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            image?: string | null;
            role: 'admin' | 'user';
            email_verified: boolean;
            provider: 'credentials' | 'google';
            /** false when the account has been deleted or deactivated by an admin */
            active: boolean;
        };
    }

    interface User {
        role?: 'admin' | 'user';
        email_verified?: boolean;
        provider?: 'credentials' | 'google';
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: ENV.authSecret,
    pages: {
        signIn: '/auth/login',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
    providers: [
        Google({
            clientId: ENV.google.clientId,
            clientSecret: ENV.google.clientSecret,
        }),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) return null;

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (!user || !user.password) return null;
                if (!user.is_active) return null; // blocked/deactivated account

                const isValid = await compare(password, user.password);

                if (!isValid) return null;

                return {
                    id: String(user.id),
                    name: user.name,
                    email: user.email,
                    image: user.profile_image,
                    role: user.role,
                    email_verified: user.email_verified,
                    provider: user.provider,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                const email = user.email as string;

                const [existingUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, email))
                    .limit(1);

                if (existingUser && !existingUser.is_active) {
                    // Reject deactivated/deleted accounts on OAuth sign-in
                    return false;
                }

                if (!existingUser) {
                    const [newUser] = await db
                        .insert(users)
                        .values({
                            name: user.name || 'User',
                            email,
                            profile_image: user.image || null,
                            provider: 'google',
                            email_verified: true,
                            role: email === ENV.adminEmail ? 'admin' : 'user',
                        })
                        .returning();

                    user.id = String(newUser.id);
                    user.role = newUser.role;
                    user.email_verified = true;
                    user.provider = 'google';
                } else {
                    user.id = String(existingUser.id);
                    user.role = existingUser.role;
                    user.email_verified = true;
                    user.provider = existingUser.provider;

                    // Update profile image if not set
                    if (!existingUser.profile_image && user.image) {
                        await db
                            .update(users)
                            .set({ profile_image: user.image })
                            .where(eq(users.id, existingUser.id));
                    }
                }
            }

            return true;
        },

        async jwt({ token, user, trigger, session }) {
            // ── Initial sign-in: stamp custom claims ──
            if (user) {
                token.id = user.id as string;
                token.role = user.role ?? 'user';
                token.email_verified = user.email_verified ?? false;
                token.provider = user.provider ?? 'credentials';
                token.active = true;
                token.lastDbCheck = Date.now();
                return token;
            }

            // ── Client-side session update (profile edit, etc.) ──
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name;
                if (session.image) token.picture = session.image;
                token.lastDbCheck = Date.now();
                return token;
            }

            // ── Periodic DB liveness check ──
            // Re-verify on every request older than DB_CHECK_INTERVAL_MS.
            // Catches: deleted accounts, deactivations, role changes.
            const now = Date.now();
            const needsCheck =
                !token.lastDbCheck ||
                now - (token.lastDbCheck as number) > DB_CHECK_INTERVAL_MS;

            if (token.id && needsCheck) {
                try {
                    const [dbUser] = await db
                        .select({
                            id: users.id,
                            name: users.name,
                            role: users.role,
                            is_active: users.is_active,
                            email_verified: users.email_verified,
                        })
                        .from(users)
                        .where(eq(users.id, +token.id))
                        .limit(1);

                    if (!dbUser || !dbUser.is_active) {
                        // Account deleted or suspended — poison the token.
                        // proxy.ts and AuthSync will force an immediate sign-out.
                        token.active = false;
                        // Do NOT bump lastDbCheck so every subsequent request re-checks.
                    } else {
                        // Sync any admin-mutable fields (role, name, email_verified)
                        token.active = true;
                        token.role = dbUser.role;
                        token.email_verified = dbUser.email_verified;
                        token.name = dbUser.name;
                        token.lastDbCheck = now;
                    }
                } catch {
                    // DB temporarily unreachable — preserve current state;
                    // never false-lock-out users due to transient DB errors.
                }
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.email = token.email as string;
            session.user.image = token.picture as string | null | undefined;
            session.user.role = (token.role ?? 'user') as 'admin' | 'user';
            session.user.email_verified = (token.email_verified ?? false) as boolean;
            session.user.provider = (token.provider ?? 'credentials') as
                | 'credentials'
                | 'google';
            // Exposed to client so AuthSync / proxy can react immediately
            session.user.active = token.active !== false;

            return session;
        },
    },
});
