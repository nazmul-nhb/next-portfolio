'use client';

import { ProjectForm } from '@/components/project-form';
import type { InsertProject } from '@/types/projects';

export default function CreateProject() {
    const submitData = (data: Partial<InsertProject>) => {
        console.log(data);
    };
    return <ProjectForm onSubmit={submitData} />;
}
