'use client';

import { Image } from '@heroui/react';
import NextImage from 'next/image';
import { useValidImage } from 'nhb-hooks';
import type { TProject } from '../types/project.types';
import Test from './test';

interface Props {
	projects: TProject[] | undefined;
}

export default function Projects({ projects }: Props) {
	const imgUrls = useValidImage(projects?.map((p) => p.favicon));

	return (
		<div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
			<Test />
			{imgUrls?.map((img, idx) => (
				<Image
					as={NextImage}
					key={idx}
					alt="img"
					src={img}
					width={300}
					height={200}
				/>
			))}
		</div>
	);
}
