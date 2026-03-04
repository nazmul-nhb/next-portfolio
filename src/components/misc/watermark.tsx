import type * as CSS from 'csstype';
import { Fragment } from 'react/jsx-runtime';
import { buildCloudinaryUrl, cn } from '@/lib/utils';
import type { Uncertain } from '@/types';

type WatermarkProps = {
    logo: Uncertain<string>;
    cardShadow?: boolean;
    grayScale?: boolean;
    children: React.ReactNode;
    bgSize?: CSS.Properties['backgroundSize'];
    bgPosition?: CSS.Properties['backgroundPosition'];
};

export function WatermarkContent({
    logo,
    cardShadow = true,
    grayScale = false,
    children,
    bgPosition = 'right',
    bgSize = 'contain',
}: WatermarkProps) {
    return (
        <Fragment>
            {logo && (
                <div
                    aria-hidden="true"
                    className={cn(
                        'pointer-events-none absolute inset-x-0 top-2 bottom-2 right-2 opacity-20 dark:opacity-10',
                        {
                            grayscale: grayScale,
                        }
                    )}
                    style={{
                        backgroundImage: `url('${buildCloudinaryUrl(logo)}')`,
                        backgroundSize: bgSize,
                        backgroundPosition: bgPosition,
                        // backgroundOrigin: 'content-box',
                        backgroundRepeat: 'no-repeat',
                        backgroundAttachment: 'local',
                    }}
                />
            )}
            <div
                className={cn('absolute inset-0 from-transparent bg-linear-to-l', {
                    'from-50% to-card/20 dark:to-card/30': cardShadow,
                })}
            />
            <div className="relative z-10">{children}</div>
        </Fragment>
    );
}
