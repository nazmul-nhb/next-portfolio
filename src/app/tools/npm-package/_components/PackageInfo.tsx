import { motion, type Variants } from 'framer-motion';
import { Code, FileText } from 'lucide-react';
import { FaGitAlt } from 'react-icons/fa';
import LivePreviewButton from '@/components/misc/live-preview';
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
                <CardHeader className="flex justify-between items-center gap-2 flex-wrap">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Package Information
                    </CardTitle>

                    {data.license && <Badge>{data.license}</Badge>}
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

                    {data.homepage && (
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Homepage
                            </p>
                            <div className="flex items-center gap-3">
                                <LivePreviewButton
                                    previewLabel="Preview Homepage"
                                    title={`Homepage of ${data.package}`}
                                    url={data.homepage}
                                />
                            </div>
                        </div>
                    )}

                    {data.repository && (
                        <div>
                            <a
                                className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:underline"
                                href={
                                    data.repository.url?.startsWith('git+')
                                        ? data.repository.url.replace('git+', '')
                                        : data.repository.url
                                }
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <FaGitAlt className="size-4 mb-0.5" />
                                Repository
                            </a>
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
                </CardContent>
            </Card>
        </motion.div>
    );
}
