import { fetchProjects } from '@/lib/actions/api.projects';

export default async function Projects() {
	const projects = await fetchProjects();

	return <div>Hello Projects {projects?.length}</div>;
}
