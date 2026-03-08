/** biome-ignore-all lint/performance/noImgElement: needed for OG generation */

import { siteConfig } from '@/configs/site';

type Props = {
    title: string;
    siteTitle: string;
    description?: string;
    tag?: string;
    url?: string;
};

export function OgImageLayout({ title, siteTitle, description, tag, url }: Props) {
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: '64px',
                background: 'linear-gradient(90deg,#050b1a,#020818)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                color: 'white',
                fontFamily: 'sans-serif',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 20,
                }}
            >
                <img
                    alt={siteConfig.name}
                    height={80}
                    src={siteConfig.baseUrl.concat(siteConfig.favicon)}
                    width={80}
                />

                <div
                    style={{
                        fontSize: 44,
                        fontWeight: 900,
                    }}
                >
                    {siteTitle}
                </div>
            </div>

            {/* Center content */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 30,
                }}
            >
                {tag && (
                    <div
                        style={{
                            fontSize: 24,
                            color: '#ffffff',
                            letterSpacing: 2,
                        }}
                    >
                        {tag.toUpperCase()}
                    </div>
                )}

                <div
                    style={{
                        fontSize: 72,
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: 'linear-gradient(90deg,#60a5fa,#a78bfa)',
                        WebkitBackgroundClip: 'text',
                        color: 'black',
                        maxWidth: 1080,
                        padding: '12px',
                    }}
                >
                    {title}
                </div>

                {description && (
                    <div
                        style={{
                            fontSize: 32,
                            color: '#fffffa',
                            maxWidth: 1080,
                            lineHeight: 1.4,
                        }}
                    >
                        {description}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 24,
                    color: '#71717a',
                }}
            >
                <span>{tag}</span>
                <span>{url?.replace('https://', '')}</span>
            </div>
        </div>
    );
}
