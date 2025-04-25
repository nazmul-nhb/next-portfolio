import type { Document } from 'mongoose';

export interface IProject extends Document {
	title: string;
	description?: string;
	link?: string;
	tags: string[];
}
