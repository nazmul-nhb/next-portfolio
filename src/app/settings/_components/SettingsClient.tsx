'use client';

import { AlertCircle, CheckCircle, LogOut, Mail, Save, Shield, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FadeInUp } from '@/components/misc/animations';
import { SettingsSkeleton } from '@/components/misc/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    deleteFromCloudinary,
    deleteOldCloudFile,
    uploadToCloudinary,
} from '@/lib/actions/cloudinary';
import { useApiMutation } from '@/lib/hooks/use-api';
import { useUpdateProfile, useUserProfile } from '@/lib/hooks/use-user';
import { useUserStore } from '@/lib/store/user-store';
import { buildCloudinaryUrl, hasErrorMessage } from '@/lib/utils';

/**
 * Settings page client component with profile editing and email verification.
 * Uses TanStack Query + Zustand for state management.
 */
export function SettingsClient() {
    const { status } = useSession();
    const router = useRouter();

    // ✅ TanStack Query hook - automatic loading, caching, refetching
    const { data: profile, isLoading } = useUserProfile();

    // ✅ Mutation hook with Zustand sync - navbar updates automatically!
    const updateProfile = useUpdateProfile();

    // ✅ Zustand store for clear profile on logout
    const { clearProfile } = useUserStore();

    const handleLogout = async () => {
        clearProfile();
        await signOut({ redirectTo: '/' });
    };

    // Local form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [publicId, setPublicId] = useState('');
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // OTP state
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpMessage, setOtpMessage] = useState('');

    const { mutate: requestOTP, isPending: otpSending } = useApiMutation<
        null,
        { email: string }
    >('/api/auth/otp', 'POST', {
        successMessage: 'OTP sent to your email!',
        prioritizeCustomMessages: true,
        invalidateKeys: ['user-profile'],
        onSuccess: () => {
            setOtpSent(true);
            setOtpMessage('OTP sent to your email!');
        },
        onError: (err) => {
            setOtpMessage(hasErrorMessage(err) ? err.message : 'Failed to send OTP');
        },
    });

    const { mutate: verifyOTP, isPending: verifyingOTP } = useApiMutation<
        null,
        { email: string; code: string }
    >('/api/auth/otp', 'PUT', {
        successMessage: 'Email verified successfully!',
        prioritizeCustomMessages: true,
        invalidateKeys: ['user-profile'],
        onSuccess: () => {
            setOtpMessage('Email verified successfully!');
        },
        onError: (err) => {
            setOtpMessage(hasErrorMessage(err) ? err.message : 'Invalid or expired OTP');
        },
    });

    const otpLoading = otpSending || verifyingOTP;

    // Redirect if unauthenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        }
    }, [status, router]);

    // Initialize form from fetched profile
    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setBio(profile.bio || '');
            setProfileImage(profile.profile_image || '');
        }
    }, [profile]);

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
        const oldImage = profileImage;
        let finalImage = profileImage;

        try {
            // Upload pending image if exists
            if (pendingImageFile) {
                setUploadingImage(true);
                const { public_id, url } = await uploadToCloudinary(
                    pendingImageFile,
                    'profile-images'
                );

                setPublicId(public_id);
                finalImage = url;
                setProfileImage(finalImage);
                setPendingImageFile(null);
                setImagePreview(null);
                setUploadingImage(false);
            }

            // ✅ Use TanStack Query mutation - auto syncs with Zustand!
            updateProfile.mutate(
                { name, bio, profile_image: finalImage },
                {
                    onError: async () => {
                        // Rollback image if upload succeeded but API failed
                        if (publicId) {
                            await deleteFromCloudinary(publicId);
                        }
                    },
                    onSuccess: async () => {
                        // Delete old image if exists and was from cloudinary
                        try {
                            await deleteOldCloudFile(oldImage, finalImage);
                        } catch (error) {
                            console.error('Failed to delete old image:', error);
                        }
                    },
                }
            );
        } catch {
            toast.error('Failed to upload image');
            setUploadingImage(false);
            return;
        }
    };

    const handleRequestOTP = () => {
        if (!profile) return;
        setOtpMessage('');
        requestOTP({ email: profile.email });
    };

    const handleVerifyOTP = () => {
        if (!profile) return;
        setOtpMessage('');
        verifyOTP({ email: profile.email, code: otp });
    };

    // ✅ Loading state from TanStack Query
    if (status === 'loading' || isLoading) return <SettingsSkeleton />;

    // ✅ No profile check - TanStack Query handles this
    if (!profile) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <p className="text-muted-foreground">Failed to load profile</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <FadeInUp>
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <Button onClick={handleLogout} size="sm" variant="ghost">
                        <LogOut className="mr-2 size-4" />
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
                                        loading={otpLoading}
                                        onClick={handleRequestOTP}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Mail className="mr-2 size-4" />
                                        {otpLoading ? 'Sending...' : 'Send Verification Code'}
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <InputOTP
                                            id="otp-verification"
                                            maxLength={6}
                                            onChange={setOtp}
                                            placeholder="Enter your OTP"
                                            required
                                            value={otp}
                                        >
                                            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-10 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                        <Button
                                            disabled={otp.length !== 6 || otpLoading}
                                            loading={otpLoading}
                                            onClick={handleVerifyOTP}
                                            size="lg"
                                        >
                                            Verify
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
                            <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary">
                                <Shield className="size-3.5" />
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
                                    disabled={uploadingImage || updateProfile.isPending}
                                    id="profile_image"
                                    onChange={handleProfileImageUpload}
                                    type="file"
                                />
                                {uploadingImage && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Upload className="size-4 animate-pulse" />
                                        Uploading image...
                                    </div>
                                )}
                                {(imagePreview || profileImage) && !uploadingImage && (
                                    <div className="relative h-24 w-24 overflow-hidden rounded-full border">
                                        {!imagePreview && profileImage.startsWith('http') ? (
                                            // biome-ignore lint/performance/noImgElement: needed for external images
                                            <img
                                                alt="Profile preview"
                                                className="object-cover"
                                                src={profileImage}
                                            />
                                        ) : (
                                            <Image
                                                alt="Profile preview"
                                                className="object-cover"
                                                fill
                                                src={
                                                    imagePreview
                                                        ? imagePreview
                                                        : buildCloudinaryUrl(profileImage)
                                                }
                                            />
                                        )}
                                        {imagePreview && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-center text-[10px] text-white">
                                                New
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            disabled={updateProfile.isPending || uploadingImage}
                            loading={updateProfile.isPending || uploadingImage}
                            onClick={handleSave}
                        >
                            <Save className="mr-2 size-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </FadeInUp>
        </div>
    );
}
