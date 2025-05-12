'use client';

import { Button, useDisclosure } from '@heroui/react';
import PortfolioModal from '@/components/ui/modal';
import ProjectForm from '@/components/projects/ProjectForm';

export default function ProjectButtons() {
	const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
	
	return (
		<div>
			<Button onPress={onOpen}>Create Project</Button>
			<PortfolioModal
				content={<ProjectForm closeModal={onClose} />}
				isOpen={isOpen}
				placement="center"
				title="Welcome Back"
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
		</div>
	);
}
