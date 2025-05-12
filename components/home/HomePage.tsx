import ProjectButtons from '@/components/projects/ProjectButtons';
import Projects from '@/components/projects/Projects';
import { Fragment } from 'react';
import { fetchProjects } from '../../lib/actions/api.projects';

export default async function HomePage() {
	const projects = await fetchProjects();

	return (
		<Fragment>
			<ProjectButtons/>
			<Projects projects={projects} />
		</Fragment>
	);
}
