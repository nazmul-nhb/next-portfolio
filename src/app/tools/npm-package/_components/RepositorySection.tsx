import { motion, type Variants } from 'framer-motion';
import { Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PackageResponse } from '@/types/npm';

interface RepositorySectionProps {
    data: PackageResponse;
    variants: Variants;
}

export function RepositorySection({ data, variants }: RepositorySectionProps) {
    if (!data.repository) return null;

    return (
        <motion.div variants={variants}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code className="size-5" />
                        Repository
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {data.repository.url && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                URL
                            </p>
                            <a
                                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                                href={data.repository.url}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {data.repository.url}
                            </a>
                        </div>
                    )}
                    {data.repository.type && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Type
                            </p>
                            <Badge variant="secondary">{data.repository.type}</Badge>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
