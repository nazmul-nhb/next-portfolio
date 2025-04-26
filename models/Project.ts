import type { TProjectDoc } from '@/types/project.types';

import { Schema, model, models } from 'mongoose';

const ProjectSchema = new Schema<TProjectDoc>(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		liveLink: { type: String, required: true },
		github: {
			type: [String],
			validate: {
				validator: (val: string[]) => val.length >= 1 && val.length <= 2,
				message: 'Github must have one or two links',
			},
			required: true,
		},
		favicon: { type: String, required: true },
		screenshots: {
			type: [String],
			validate: {
				validator: (val: string[]) => val.length === 3,
				message: 'Screenshots must be an array of exactly three strings',
			},
			required: true,
		},
		technologies: { type: [String], required: true },
		features: { type: [String], required: true },
		lastUpdated: { type: String, required: true },
	},
	{ timestamps: true, versionKey: false }
);

export const Project = models.Project || model('Project', ProjectSchema);
