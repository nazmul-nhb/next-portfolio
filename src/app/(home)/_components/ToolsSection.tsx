import Link from 'next/link';
import { shuffleArray } from 'nhb-toolbox';
import { MotionCard, SectionHeading, StaggerContainer } from '@/components/misc/animations';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/configs/site';

export default function ToolsSection() {
    return (
        <section className="py-8 sm:py-14 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
                <div className="mb-12 flex items-start justify-between">
                    <SectionHeading subtitle="Quick utilities for developers and everyday productivity">
                        Productivity Tools
                    </SectionHeading>

                    <Link className="mt-1" href="/tools">
                        <Button variant="outline">Explore All</Button>
                    </Link>
                </div>

                <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {shuffleArray(siteConfig.toolsMenus)
                        .slice(0, 6)
                        .map(({ description, href, icon: Icon, label }) => (
                            <MotionCard key={label}>
                                <Link
                                    className="transition-transform duration-300 hover:scale-102"
                                    href={href}
                                >
                                    <Card className="group h-full border-muted/60 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-3 text-base">
                                                <span className="flex items-center justify-center rounded-md bg-primary/10 text-primary size-9 transition-colors group-hover:bg-primary/15">
                                                    <Icon className="size-5" />
                                                </span>

                                                <span className="leading-none">{label}</span>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <CardDescription className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                                                {description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </MotionCard>
                        ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
