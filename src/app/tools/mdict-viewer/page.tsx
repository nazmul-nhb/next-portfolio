import { join } from 'node:path';
import { MDD, MDX } from 'js-mdict';
import { notFound } from 'next/navigation';
import TitleWithShare from '@/app/tools/_components/TitleWithShare';
import { MDictServer } from '@/lib/mdict/server';
import MDictViewer from './_components/MDictViewer';

const basePath = join(process.cwd(), 'src', 'data', 'phrase-finder');

const fileName = 'The PhraseFinder 2020';

export default function MDictPage() {
    const mdxPath = join(basePath, `${fileName}.mdx`);
    const mddPath = join(basePath, `${fileName}.mdd`);

    const mdx = new MDX(mdxPath, {
        debug: true,
        isCaseSensitive: false,
        isStripKey: true,
    });

    const mdd = new MDD(mddPath, {
        debug: true,
        isCaseSensitive: false,
        isStripKey: true,
    });

    const dict = new MDictServer(mdx, mdd, basePath);

    const def = dict.lookup('come-what-may');

    if (!def) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <TitleWithShare
                description={'description'}
                route="/tools/mdict-viewer"
                title="MDict Viewer"
            />
            <MDictViewer html={def.html} resources={def.resources} />
        </div>
    );
}
