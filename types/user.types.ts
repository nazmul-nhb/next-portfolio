import type {
	UserLoginSchema,
	UserRegisterFields,
	UserRegistrationSchema,
	UserUpdateSchema,
} from '@/schema/user.schema';
import type { z } from 'zod';
import type { DBItem } from '.';
import type { Document } from 'mongoose';
import type { JwtPayload } from 'jsonwebtoken';

export type TCredentials = z.infer<typeof UserLoginSchema>;

export type TRegisterUser = z.infer<typeof UserRegistrationSchema>;

export type TUserFields = z.infer<typeof UserRegisterFields>;

export type TUpdateUser = z.infer<typeof UserUpdateSchema>;

export type TUser = DBItem & TRegisterUser;

export type TUserDoc = TUser & Document;

export interface IUser extends Omit<TUser, 'password'> {}

export type DecodedUser = TUser & Pick<JwtPayload, 'iat' | 'exp'>;
