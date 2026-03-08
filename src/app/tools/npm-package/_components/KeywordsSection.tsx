import { motion, type Variants } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PackageResponse } from '@/types/npm';

interface KeywordsSectionProps {
    data: PackageResponse;
    variants: Variants;
}

export function KeywordsSection({ data, variants }: KeywordsSectionProps) {
    if (!data.keywords || data.keywords.length === 0) return null;

    return (
        <motion.div variants={variants}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {data.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
