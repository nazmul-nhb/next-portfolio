import { motion, type Variants } from 'framer-motion';
import { Mail, User, Users } from 'lucide-react';
import { isValidArray } from 'nhb-toolbox';
import LivePreviewButton from '@/components/misc/live-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Contributor, PackageResponse } from '@/types/npm';

interface AuthorsSectionProps {
    data: PackageResponse;
    variants: Variants;
}

export function AuthorsSection({ data, variants }: AuthorsSectionProps) {
    if (!data.author && !data.maintainers?.length && !data.contributors?.length) {
        return null;
    }

    return (
        <motion.div className="space-y-3" variants={variants}>
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

                        <p className="text-xs font-medium text-muted-foreground">Contact</p>
                        <div className="flex items-center gap-3 mt-2">
                            {data.author.email && (
                                <a
                                    href={`mailto:${data.author.email}`}
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    <Button
                                        className="gap-1 sm:gap-2"
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Mail className="size-4" />
                                        Email
                                    </Button>
                                </a>
                            )}
                            {data.author.url && (
                                <LivePreviewButton
                                    previewLabel="Preview URL"
                                    title={
                                        data.author.name || `Website of ${data.package} author`
                                    }
                                    url={data.author.url}
                                />
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {isValidArray(data?.contributors) && (
                <Maintributors data={data.contributors} title="Contributors" />
            )}

            {isValidArray(data?.maintainers) && (
                <Maintributors data={data.maintainers} title="Maintainers" />
            )}
        </motion.div>
    );
}

type MaintainerProps = {
    title: string;
    data: Partial<Contributor>[];
};

function Maintributors({ title, data }: MaintainerProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="size-4" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-40 custom-scroll overflow-y-auto">
                    {data.map((maintainer, idx) => (
                        <div
                            className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-sm"
                            key={idx}
                        >
                            <span className="font-medium truncate">{maintainer.name}</span>
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
    );
}
