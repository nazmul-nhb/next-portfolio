'use client';

import { motion, type Variants } from 'framer-motion';
import { PackagePlus } from 'lucide-react';
import { useStorage } from 'nhb-hooks';
import { IoGitNetworkSharp } from 'react-icons/io5';
import { SiBun, SiDeno, SiNpm, SiPnpm, SiYarn } from 'react-icons/si';
import CodeBlock from '@/components/misc/code-block';
import CopyButton from '@/components/misc/copy-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const PKG_MANAGERS = {
    npm: { Icon: SiNpm, cmd: 'npm install ' },
    pnpm: { Icon: SiPnpm, cmd: 'pnpm add ' },
    yarn: { Icon: SiYarn, cmd: 'yarn add ' },
    deno: { Icon: SiDeno, cmd: 'deno add npm:' },
    bun: { Icon: SiBun, cmd: 'bun add ' },
    vlt: { Icon: IoGitNetworkSharp, cmd: 'vlt install ' },
};

type PkgMgr = keyof typeof PKG_MANAGERS;

type Props = {
    packageName: string;
    variants: Variants;
};

export default function InstallPackage({ packageName, variants }: Props) {
    const pkgMgr = useStorage<PkgMgr>({
        key: 'nhb-pkg-mgr',
        serialize: (val) => val,
        deserialize: (val) => val as PkgMgr,
    });

    const { Icon, cmd } = PKG_MANAGERS[pkgMgr.value || 'npm'];

    return (
        <motion.div className="space-y-3" variants={variants}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 justify-between flex-wrap select-none">
                        <span className="flex items-center gap-2">
                            <PackagePlus className="size-4" />
                            Install <Badge>{packageName}</Badge>
                        </span>
                        <Select
                            onValueChange={(val) => pkgMgr.set(val as PkgMgr)}
                            value={pkgMgr.value || 'npm'}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Package Manager" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Package Manager</SelectLabel>
                                    {Object.keys(PKG_MANAGERS).map((pkgMgr) => (
                                        <SelectItem key={pkgMgr} value={pkgMgr}>
                                            {pkgMgr}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Badge className="gap-2 text-sm select-none" variant={'secondary'}>
                        <Icon className="size-3" /> {pkgMgr.value || 'npm'}
                    </Badge>
                    <CodeBlock className="flex items-center gap-2 flex-wrap justify-between">
                        <span>{cmd + packageName}</span>
                        <CopyButton
                            size={'icon-xs'}
                            successMsg={`Installation command copied to clipboard!`}
                            textToCopy={cmd + packageName}
                        />
                    </CodeBlock>
                </CardContent>
            </Card>
        </motion.div>
    );
}
