import { z } from 'zod';

export const ProjectCreationSchema = z.object({
	title: z.string({ required_error: 'Title is required' }),
	description: z.string({ required_error: 'Description is required' }),
	liveLink: z.string({ required_error: 'Live link is required' }),
	github: z.tuple([
		z.string({ required_error: 'First GitHub link is required' }),
		z.string().optional(),
	]),
	favicon: z.string({ required_error: 'Favicon is required' }),
	screenshots: z.tuple([
		z.string({ required_error: 'Screenshot 1 is required' }),
		z.string({ required_error: 'Screenshot 2 is required' }),
		z.string({ required_error: 'Screenshot 3 is required' }),
	]),
	technologies: z.array(z.string()).min(1, 'Minimum 1 technology required'),
	features: z.array(z.string()).min(1, 'Minimum 1 feature required'),
	lastUpdated: z.string({ required_error: 'Last update time is required' }),
});
