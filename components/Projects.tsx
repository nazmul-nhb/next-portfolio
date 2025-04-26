import { fetchProjects } from '@/lib/api.projects';

export default async function Projects() {
	const projects = await fetchProjects();

	return <div>Hello Projects {projects?.length}</div>;
}
