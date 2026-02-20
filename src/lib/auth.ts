import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { ENV } from '@/configs/env';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';

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
            if (user) {
                token.id = user.id as string;
                token.role = user.role || 'user';
                token.email_verified = user.email_verified ?? false;
                token.provider = user.provider || 'credentials';
            }

            // Handle session updates from client (updateSession call)
            if (trigger === 'update' && session) {
                if (session.name) token.name = session.name;
                if (session.image !== undefined) token.picture = session.image;
            }

            return token;
        },

        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.email = token.email as string;
            session.user.image = token.picture as string | null | undefined;
            session.user.role = token.role as 'admin' | 'user';
            session.user.email_verified = token.email_verified as boolean;
            session.user.provider = token.provider as 'credentials' | 'google';

            return session;
        },
    },
});
