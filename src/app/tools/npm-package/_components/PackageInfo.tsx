import { motion, type Variants } from 'framer-motion';
import { Code, Copyright, FileText, PackageCheck, PackagePlus } from 'lucide-react';
import { formatDateRelative, isValidObject } from 'nhb-toolbox';
import { FaGitAlt } from 'react-icons/fa';
import { RiNpmjsLine } from 'react-icons/ri';
import CodeBlock from '@/components/misc/code-block';
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
    const distTags = data['dist-tags'];

    return (
        <motion.div variants={variants}>
            <Card>
                <CardHeader className="flex justify-between items-center gap-2 flex-wrap select-none">
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="size-5" />
                        Package Info
                        {distTags?.latest && <Badge>Latest: {distTags.latest} </Badge>}
                    </CardTitle>

                    {data.license && (
                        <Badge className="items-center gap-1" variant={'destructive'}>
                            <Copyright className="size-3.5" /> {data.license}
                        </Badge>
                    )}
                </CardHeader>
                <CardContent className="space-y-5">
                    {data.time && (
                        <div className="flex flex-wrap gap-2">
                            {data.time.created && (
                                <Badge variant="secondary">
                                    <PackagePlus className="size-3 mr-1" />
                                    Created: {formatDateRelative(data.time.created)}
                                </Badge>
                            )}
                            {data.time.modified && (
                                <Badge variant="secondary">
                                    <PackageCheck className="size-3 mr-1" />
                                    Updated: {formatDateRelative(data.time.modified)}
                                </Badge>
                            )}
                        </div>
                    )}

                    {data.description && (
                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2">
                                Description
                            </h3>
                            <p className="text-sm text-foreground">{data.description}</p>
                        </div>
                    )}

                    {data.homepage && (
                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2">
                                Links
                            </h3>
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

                    {isValidObject(distTags) && (
                        <div>
                            <h3 className="text-xs font-medium text-muted-foreground mb-2">
                                Version Tags
                            </h3>
                            <CodeBlock className="flex flex-wrap gap-2 rounded-none overflow-y-auto custom-scroll max-h-40 border py-2 px-1">
                                {Object.entries(distTags)
                                    .reverse()
                                    .map(([tag, version]) => (
                                        <Badge key={tag} variant="secondary">
                                            <Code className="size-3 mr-1" />
                                            {tag}: {version}
                                        </Badge>
                                    ))}
                            </CodeBlock>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
