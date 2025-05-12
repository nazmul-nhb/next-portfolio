'use client';

import { Button, useDisclosure } from '@heroui/react';
import PortfolioModal from '../ui/modal';
import ProjectForm from './ProjectForm';

export default function ProjectButtons() {
	const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
	return (
		<div>
			<Button onPress={onOpen}>Create Project</Button>
			<PortfolioModal
				content={<ProjectForm onClose={onClose} />}
				isOpen={isOpen}
				placement="center"
				title="Welcome Back"
				onClose={onClose}
				onOpenChange={onOpenChange}
			/>
		</div>
	);
}
