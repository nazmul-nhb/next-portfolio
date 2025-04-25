import type { IProject } from '@/types/Project';

import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/db';
import { Project } from '@/models/Project';

/**
 * * GET all projects
 */
export async function GET(): Promise<NextResponse> {
	await connectDB();
	const projects: IProject[] = await Project.find().sort('-createdAt');

	return NextResponse.json(projects);
}

/**
 * * POST a new project
 */
export async function POST(req: Request): Promise<NextResponse> {
	await connectDB();
	const data: IProject = await req.json();
	const project: IProject = await Project.create(data);

	return NextResponse.json(project, { status: 201 });
}
