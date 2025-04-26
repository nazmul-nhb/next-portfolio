import type { TProjectData, TProjectDoc } from '@/types/project.types';
import type { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import { sendResponse } from '@/lib/sendResponse';
import { validateRequest } from '@/lib/validateRequest';
import { Project } from '@/models/Project';
import { ProjectCreationSchema } from '@/schema/project.schema';

/**
 * * GET all projects
 */
export async function GET(): Promise<NextResponse> {
	await connectDB();
	const projects: TProjectDoc[] = await Project.find().sort('-createdAt');

	return sendResponse('Project', 'GET', projects);
}

/**
 * * POST a new project
 */
export async function POST(req: Request): Promise<NextResponse> {
	await connectDB();

	const data: TProjectData = await req.json();

	const parsed = await validateRequest(ProjectCreationSchema, data);

	if (!parsed.success) {
		return parsed.response;
	}

	const project: TProjectDoc = await Project.create(parsed.data);

	return sendResponse('Project', 'POST', project);
}
