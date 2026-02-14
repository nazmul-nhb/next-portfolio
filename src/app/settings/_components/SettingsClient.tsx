'use client';

import { AlertCircle, CheckCircle, LogOut, Mail, Save, Shield, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { FadeInUp } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { httpRequest } from '@/lib/actions/baseRequest';
import { deleteFromCloudinary, uploadToCloudinary } from '@/lib/actions/cloudinary';
import { buildCloudinaryPublicId, buildCloudinaryUrl } from '@/lib/utils';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    profile_image: string | null;
    bio: string | null;
    role: string;
    provider: string;
    email_verified: boolean;
}

/**
 * Settings page client component with profile editing and email verification.
 */
export function SettingsClient() {
    const { status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');

    const fetchProfile = useCallback(async () => {
        try {
            const { data } = await httpRequest<UserProfile>('/api/users/me');
            if (data) {
                setProfile(data);
                setName(data.name);
                setBio(data.bio || '');
                setProfileImage(data.profile_image || '');
            }
        } catch {
            // Not logged in
        }
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status, router, fetchProfile]);

    const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPendingImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            let finalImage = profileImage;

            // Upload pending image if exists
            if (pendingImageFile) {
                setUploadingImage(true);
                const oldImage = profileImage;
                const result = await uploadToCloudinary(pendingImageFile, 'profile-images');

                finalImage = result.url;
                setProfileImage(finalImage);
                setPendingImageFile(null);
                setImagePreview(null);
                setUploadingImage(false);

                // Delete old image if exists and was from cloudinary
                if (oldImage && !oldImage.startsWith('http')) {
                    try {
                        await deleteFromCloudinary(buildCloudinaryPublicId(oldImage));
                    } catch (error) {
                        console.error('Failed to delete old image:', error);
                    }
                }
            }

            await httpRequest('/api/users/me', {
                method: 'PATCH',
                body: {
                    name: name || undefined,
                    bio: bio || undefined,
                    profile_image: finalImage || undefined,
                },
            });
            setSaveMessage('Profile updated successfully!');
            fetchProfile();
        } catch {
            setSaveMessage('Failed to update profile');
        } finally {
            setSaving(false);
            setUploadingImage(false);
        }
    };

    const handleRequestOTP = async () => {
        if (!profile) return;
        setOtpLoading(true);
        setOtpMessage('');
        try {
            await httpRequest('/api/auth/otp', {
                method: 'POST',
                body: { email: profile.email },
            });
            setOtpSent(true);
            setOtpMessage('OTP sent to your email!');
        } catch (err) {
            const msg =
                typeof err === 'object' && err !== null && 'message' in err
                    ? String((err as { message: string }).message)
                    : 'Failed to send OTP';
            setOtpMessage(msg);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!profile) return;
        setOtpLoading(true);
        setOtpMessage('');
        try {
            await httpRequest('/api/auth/otp', {
                method: 'PUT',
                body: { email: profile.email, code: otp },
            });
            setOtpMessage('Email verified successfully!');
            fetchProfile();
            setOtpSent(false);
            setOtp('');
        } catch {
            setOtpMessage('Invalid or expired OTP');
        } finally {
            setOtpLoading(false);
        }
    };

    if (status === 'loading' || !profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <FadeInUp>
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <Button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        size="sm"
                        variant="ghost"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </FadeInUp>

            {/* Email Verification Banner */}
            {!profile.email_verified && profile.provider === 'credentials' && (
                <FadeInUp delay={0.1}>
                    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                            <div className="flex-1">
                                <h3 className="mb-1 font-medium text-amber-800 dark:text-amber-200">
                                    Verify Your Email
                                </h3>
                                <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
                                    Please verify your email to write blog posts and interact
                                    with content.
                                </p>

                                {!otpSent ? (
                                    <Button
                                        disabled={otpLoading}
                                        onClick={handleRequestOTP}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Mail className="mr-2 h-4 w-4" />
                                        {otpLoading ? 'Sending...' : 'Send Verification Code'}
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            className="max-w-40"
                                            maxLength={6}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="Enter OTP"
                                            value={otp}
                                        />
                                        <Button
                                            disabled={otp.length !== 6 || otpLoading}
                                            onClick={handleVerifyOTP}
                                            size="sm"
                                        >
                                            {otpLoading ? 'Verifying...' : 'Verify'}
                                        </Button>
                                    </div>
                                )}

                                {otpMessage && (
                                    <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                                        {otpMessage}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </FadeInUp>
            )}

            {profile.email_verified && (
                <FadeInUp delay={0.1}>
                    <div className="mb-8 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                            Email verified
                        </span>
                        {profile.role === 'admin' && (
                            <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
                                <Shield className="h-3 w-3" />
                                Admin
                            </span>
                        )}
                    </div>
                </FadeInUp>
            )}

            {/* Profile Form */}
            <FadeInUp delay={0.2}>
                <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
                    <h2 className="mb-6 text-xl font-bold">Profile Information</h2>
                    <div className="space-y-5">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                className="mt-1.5 bg-muted"
                                disabled
                                id="email"
                                value={profile.email}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                Email cannot be changed. Contact admin for assistance.
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                className="mt-1.5"
                                id="name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                value={name}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                className="mt-1.5 min-h-25 resize-y"
                                id="bio"
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell others a little about yourself..."
                                value={bio}
                            />
                        </div>

                        <div>
                            <Label htmlFor="profile_image">Profile Image</Label>
                            <div className="mt-1.5 space-y-3">
                                <Input
                                    accept="image/*"
                                    className="cursor-pointer"
                                    disabled={uploadingImage || saving}
                                    id="profile_image"
                                    onChange={handleProfileImageUpload}
                                    type="file"
                                />
                                {uploadingImage && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Upload className="h-4 w-4 animate-pulse" />
                                        Uploading image...
                                    </div>
                                )}
                                {(imagePreview || profileImage) && !uploadingImage && (
                                    <div className="relative h-24 w-24 overflow-hidden rounded-full border">
                                        <Image
                                            alt="Profile preview"
                                            className="object-cover"
                                            fill
                                            src={
                                                imagePreview
                                                    ? imagePreview
                                                    : profileImage.startsWith('http')
                                                      ? profileImage
                                                      : buildCloudinaryUrl(profileImage)
                                            }
                                        />
                                        {imagePreview && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                                                Pending upload
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {saveMessage && (
                            <p
                                className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-destructive'}`}
                            >
                                {saveMessage}
                            </p>
                        )}

                        <Button disabled={saving} onClick={handleSave}>
                            <Save className="mr-2 h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
