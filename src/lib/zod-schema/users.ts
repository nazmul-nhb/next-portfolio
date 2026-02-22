import z from 'zod';

/** Schema for user login. */
export const LoginSchema = z
    .object({
        email: z.email('Please enter a valid email address'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(128, 'Password must be at most 128 characters'),
    })
    .strict();

/** Schema for user registration. */
export const RegisterSchema = LoginSchema.extend({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(128, 'Name must be at most 128 characters'),
}).strict();

/** Schema for updating user profile. */
export const UpdateProfileSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(128, 'Name must be at most 128 characters')
        .optional(),
    bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
    profile_image: z
        .string('Must be a valid cloudinary image')
        .startsWith('v', { error: 'Must be a valid cloudinary image' })
        .optional(),
});

/** Schema for OTP verification. */
export const OTPSchema = z
    .object({
        email: z.email('Please enter a valid email address'),
        code: z.string().length(6, 'OTP must be exactly 6 digits'),
    })
    .strict();

/** Schema for requesting OTP. */
export const RequestOTPSchema = z
    .object({
        email: z.email('Please enter a valid email address'),
    })
    .strict();
