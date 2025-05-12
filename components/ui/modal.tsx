'use client';

import {
	Button,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	type ModalProps,
} from '@heroui/react';
import { type ReactNode } from 'react';

/**
 * Props for PortfolioModal component
 */
interface Props extends Omit<ModalProps, 'title' | 'content' | 'children'> {
	/** Title displayed at the top of the modal */
	title: ReactNode;
	/** Content displayed inside the modal body */
	content: ReactNode;
	/** Custom label for the close button */
	closeButtonLabel?: ReactNode;
}

/**
 * A reusable and customizable modal component for the portfolio.
 */
export default function PortfolioModal({
	isOpen,
	onOpenChange,
	title,
	content,
	closeButtonLabel = 'Close',
	...rest
}: Props) {
	return (
		<Modal isOpen={isOpen} onOpenChange={onOpenChange} {...rest}>
			<ModalContent className="max-h-[80vh] overflow-hidden">
				{(onClose) => (
					<>
						<ModalHeader>{title}</ModalHeader>
						<ModalBody className="max-h-[70vh] overflow-y-auto">{content}</ModalBody>
						<ModalFooter>
							<Button color="danger" variant="light" onPress={onClose}>
								{closeButtonLabel}
							</Button>
						</ModalFooter>
					</>
				)}
			</ModalContent>
		</Modal>
	);
}
