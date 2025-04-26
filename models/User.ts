import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema(
	{
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['admin', 'visitor'], default: 'visitor' },
	},
	{ timestamps: true }
);

export const User = models.User || model('User', UserSchema);
