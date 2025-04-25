import type { IProject } from '@/types/Project';

import { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema<IProject>(
	{
		title: { type: String, required: true },
		description: String,
		link: String,
		tags: [String],
	},
	{ timestamps: true }
);

export const Project = models.Project || model('Project', ProjectSchema);
