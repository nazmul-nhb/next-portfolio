import Projects from '@/components/home/Projects';
import { Fragment } from 'react';
import { fetchProjects } from '../../lib/actions/api.projects';

export default async function HomePage() {
	const projects = await fetchProjects();

	return (
		<Fragment>
			<Projects projects={projects} />
		</Fragment>
	);
}
