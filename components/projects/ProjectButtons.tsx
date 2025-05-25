'use client';

import ProjectForm from '@/components/projects/ProjectForm';
import PortfolioModal from '@/components/ui/modal';
import { Button, useDisclosure } from '@heroui/react';

export default function ProjectButtons() {
	const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();

	return (
		<div>
			<Button onPress={onOpen}>Create Project</Button>
			<PortfolioModal
				content={<ProjectForm closeModalAction={onClose} />}
				isOpen={isOpen}
				placement="center"
				title="Welcome Back"
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
		</div>
	);
}
