import { motion, type Variants } from 'framer-motion';
import { Code, FileText, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PackageResponse } from '@/types/npm';

interface PackageInfoProps {
    data: PackageResponse;
    variants: Variants;
}

export function PackageInfo({ data, variants }: PackageInfoProps) {
    if (!data.description && !data['dist-tags'] && !data.license && !data.homepage) {
        return null;
    }

    return (
        <motion.div variants={variants}>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Package Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    {data.description && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Description
                            </p>
                            <p className="text-sm text-foreground">{data.description}</p>
                        </div>
                    )}

                    {data['dist-tags'] && Object.keys(data['dist-tags']).length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Version Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(data['dist-tags']).map(([tag, version]) => (
                                    <Badge key={tag} variant="secondary">
                                        <Code className="size-3 mr-1" />
                                        {tag}: {version}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {data.license && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    License
                                </p>
                                <Badge>{data.license}</Badge>
                            </div>
                        )}

                        {data.homepage && (
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Homepage
                                </p>
                                <a
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    href={data.homepage}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <LinkIcon className="size-3" />
                                    View Homepage
                                </a>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
