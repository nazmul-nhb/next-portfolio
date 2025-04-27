import type { TProjectData } from '@/types/project.types';

import { NextResponse } from 'next/server';

import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';
import { ProjectCreationSchema } from '@/schema/project.schema';

/**
 * * GET all projects
 */
export async function GET() {
	try {
		await connectDB();
		const projects = await Project.find().sort('-createdAt');

		return sendResponse('Project', 'GET', projects);
	} catch (error) {
		console.error(error);

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

/**
 * * POST a new project
 */
export async function POST(req: Request) {
	try {
		await connectDB();

		const data: TProjectData = await req.json();

		const parsed = await validateRequest(ProjectCreationSchema, data);

		if (!parsed.success) {
			return parsed.response;
		}

		const project = await Project.create(parsed.data);

		if (project?._id) {
			return sendResponse('Project', 'POST', project);
		}
	} catch (error) {
		console.error(error);

		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
