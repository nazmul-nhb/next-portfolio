export const dynamic = 'force-dynamic';

import { Link } from '@heroui/link';
import { button as buttonStyles } from '@heroui/theme';

import { GithubIcon } from '@/components/icons';
import { siteConfig } from '@/config/site';
import { subtitle, title } from '@/styles/primitives';
import HomePage from '../components/home/HomePage';

export default function Home() {
	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<HomePage />
			<div className="inline-block max-w-xl text-center justify-center">
				<span className={title()}>Make&nbsp;</span>
				<span className={title({ color: 'violet' })}>beautiful&nbsp;</span>
				<br />
				<span className={title()}>
					websites regardless of your design experience.
				</span>
				<div className={subtitle({ class: 'mt-4' })}>
					Beautiful, fast and modern React UI library.
				</div>
			</div>

			<div className="flex gap-3">
				<Link
					isExternal
					className={buttonStyles({ variant: 'bordered', radius: 'full' })}
					href={siteConfig.links.github}
				>
					<GithubIcon size={20} />
					GitHub
				</Link>
			</div>
		</section>
	);
}
