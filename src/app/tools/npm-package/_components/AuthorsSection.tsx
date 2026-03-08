import { motion, type Variants } from 'framer-motion';
import { User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PackageResponse } from '@/types/npm';

interface AuthorsSectionProps {
    data: PackageResponse;
    variants: Variants;
}

export function AuthorsSection({ data, variants }: AuthorsSectionProps) {
    if (!data.author && !data.maintainers?.length && !data.contributors?.length) {
        return null;
    }

    return (
        <motion.div variants={variants}>
            <div className="grid gap-4 md:grid-cols-2">
                {data.author && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="size-4" />
                                Author
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {data.author.name && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Name
                                    </p>
                                    <p className="text-sm font-medium">{data.author.name}</p>
                                </div>
                            )}
                            {data.author.email && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Email
                                    </p>
                                    <a
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        href={`mailto:${data.author.email}`}
                                    >
                                        {data.author.email}
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {data.maintainers && data.maintainers.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Maintainers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {data.maintainers.map((maintainer, idx) => (
                                    <div
                                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
                                        key={idx}
                                    >
                                        <span className="font-medium truncate">
                                            {maintainer.name}
                                        </span>
                                        {maintainer.email && (
                                            <a
                                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-2"
                                                href={`mailto:${maintainer.email}`}
                                            >
                                                Email
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </motion.div>
    );
}
