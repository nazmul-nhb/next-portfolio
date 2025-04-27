import type { TUserDoc } from '@/types/user.types';

import { Schema } from 'mongoose';

import { createModel } from '@/lib/db';

const UserSchema = new Schema<TUserDoc>(
	{
		name: { type: String, required: true },
		image: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['admin', 'visitor'], default: 'visitor' },
	},
	{ timestamps: true, versionKey: false }
);

export const User = createModel('User', UserSchema);
