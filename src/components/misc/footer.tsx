import Image from 'next/image';
import { siteConfig } from '@/configs/site';
import { getCurrentYear } from '@/lib/utils';

export default function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2.5">
                        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
                            NH
                        </div> */}
                        <Image
                            alt={siteConfig.name}
                            className="h-8 w-8 rounded-full object-fit"
                            height={520}
                            quality={100}
                            src={siteConfig.logoSvg}
                            width={520}
                        />
                        <span className="font-semibold">{siteConfig.name}</span>
                    </div>
                    <div className="flex gap-5">
                        {Object.entries(siteConfig.links).map(([name, url]) => (
                            <a
                                className="text-sm text-muted-foreground capitalize transition-colors hover:text-foreground"
                                href={url}
                                key={name}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {name}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="border-t border-border/40 pt-6 text-center">
                    <p className="text-xs text-muted-foreground">
                        &copy; {getCurrentYear()} {siteConfig.name}
                        <br />
                        Built with ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
}
