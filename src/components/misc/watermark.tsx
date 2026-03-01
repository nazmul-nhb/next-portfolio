import { Fragment } from 'react/jsx-runtime';
import { buildCloudinaryUrl } from '@/lib/utils';
import type { Uncertain } from '@/types';

type WatermarkContentProps = {
    logo: Uncertain<string>;
    children: React.ReactNode;
};

export function WatermarkContent({ logo, children }: WatermarkContentProps) {
    return (
        <Fragment>
            {logo && (
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-2 bottom-2 right-2 opacity-30 grayscale dark:opacity-15"
                    style={{
                        backgroundImage: `url('${buildCloudinaryUrl(logo)}')`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'right',
                        // backgroundOrigin: 'content-box',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'local',
                    }}
                />
            )}
            <div className="absolute inset-0 bg-linear-to-l from-transparent from-50% to-card/20 dark:to-card/30" />
            <div className="relative z-10">{children}</div>
        </Fragment>
    );
}
