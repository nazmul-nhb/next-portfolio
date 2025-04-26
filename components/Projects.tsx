import { fetchProjects } from '@/lib/actions';

export default async function Projects() {
	const projects = await fetchProjects();

	console.log(projects);

	return <div>Hello Projects {projects?.length}</div>;
}
