'use client';

import { ProjectForm } from '@/components/forms/project-form';
import type { InsertProject } from '@/types/projects';

export default function CreateProject() {
    const submitData = (data: InsertProject) => {
        console.log(data);
    };
    return <ProjectForm onSubmit={submitData} />;
}
