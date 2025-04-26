import type { ProjectCreationSchema } from '@/schema/project.schema';
import type { Document } from 'mongoose';
import type { z } from 'zod';
import type { DBItem } from './index';

export type TProjectData = z.infer<typeof ProjectCreationSchema>;

export type TProjectDoc = TProjectData & Document;

export type TProject = DBItem & TProjectData;
