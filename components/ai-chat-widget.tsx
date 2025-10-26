'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
// import { AIChat } from "./ai-chat"

export function AIChatWidget() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{isOpen && (
				<div className="fixed bottom-20 right-4 z-40 w-96 max-w-[calc(100vw-2rem)]">
					{/* <AIChat onClose={() => setIsOpen(false)} /> */}
				</div>
			)}

			<Button
				onClick={() => setIsOpen(!isOpen)}
				className="fixed bottom-4 right-4 z-40 rounded-full"
				size="lg"
			>
				<MessageCircle className="h-5 w-5" />
			</Button>
		</>
	);
}
