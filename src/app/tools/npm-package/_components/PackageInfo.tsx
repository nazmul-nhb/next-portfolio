import { motion, type Variants } from 'framer-motion';
import { Code, FileText } from 'lucide-react';
import { FaGitAlt } from 'react-icons/fa';
import { RiNpmjsLine } from 'react-icons/ri';
import LivePreviewButton from '@/components/misc/live-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
                        Package Info
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
                                Links
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <LivePreviewButton
                                    previewLabel="Preview Homepage"
                                    title={data.package}
                                    url={data.homepage}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={`https://www.npmjs.com/package/${data.package}`}
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Button className="gap-1 sm:gap-2" size="sm" variant="default">
                                <RiNpmjsLine className="size-4" />
                                Visit NPM Registry
                            </Button>
                        </a>
                        {data.repository && (
                            <a
                                href={
                                    data.repository.url?.startsWith('git+')
                                        ? data.repository.url.replace('git+', '')
                                        : data.repository.url
                                }
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <Button className="gap-1 sm:gap-2" size="sm" variant="outline">
                                    <FaGitAlt className="size-4" />
                                    Visit Repository
                                </Button>
                            </a>
                        )}
                    </div>

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
