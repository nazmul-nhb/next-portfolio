import { z } from 'zod';

import { ImageSchema } from './files.schema';

export const UserLoginSchema = z
	.object({
		email: z
			.string({ required_error: 'Email is required' })
			.email('Please provide a valid email!'),
		password: z.string({ required_error: 'Password is required' }),
	})
	.strict();

export const UserRegistrationSchema = UserLoginSchema.extend({
	name: z.string({ required_error: 'Name is required' }),
	image: z.string({ required_error: 'Image is required' }),
	role: z
		.enum(['admin', 'visitor'], {
			required_error: 'Role is required!',
		})
		.default('visitor')
		.optional(),
}).strict();

export const UserUpdateSchema = UserRegistrationSchema.omit({ email: true })
	.partial()
	.strict();

export const UserRegisterFields = UserRegistrationSchema.omit({
	image: true,
	role: true,
}).extend({
	image: ImageSchema,
});

export const UserUpdateFields = UserRegisterFields.omit({ email: true }).strict();
