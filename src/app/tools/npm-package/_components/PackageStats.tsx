import { motion, type Variants } from 'framer-motion';
import { Calendar, Download, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { PackageResponse } from '@/types/npm';

function formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: 'blue' | 'emerald' | 'purple' | 'amber' | 'pink';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
    const colorClasses = {
        blue: 'text-blue-600 dark:text-blue-400',
        emerald: 'text-emerald-600 dark:text-emerald-400',
        purple: 'text-purple-600 dark:text-purple-400',
        amber: 'text-amber-600 dark:text-amber-400',
        pink: 'text-pink-600 dark:text-pink-400',
    };

    return (
        <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="h-full">
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-muted-foreground">{label}</p>
                            <div className={colorClasses[color]}>{icon}</div>
                        </div>
                        <motion.p
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xl md:text-2xl font-bold tracking-tight"
                            initial={{ opacity: 0, scale: 0.8 }}
                            key={value}
                            transition={{ duration: 0.25 }}
                        >
                            {value}
                        </motion.p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

interface PackageStatsProps {
    data: PackageResponse;
    variants: Variants;
}

export function PackageStats({ data, variants }: PackageStatsProps) {
    return (
        <motion.div className="space-y-3" variants={variants}>
            <div className="flex flex-wrap gap-4">
                <StatCard
                    color="purple"
                    icon={<Package className="size-4" />}
                    label="Package"
                    value={data.package}
                />
                <StatCard
                    color="emerald"
                    icon={<Download className="size-4" />}
                    label="Total Downloads"
                    value={formatNumber(data.downloads)}
                />
            </div>
            <StatCard
                color="blue"
                icon={<Calendar className="size-4" />}
                label="Period"
                value={`${data.start} to ${data.end}`}
            />
        </motion.div>
    );
}
