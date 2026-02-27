'use client';

import Script from 'next/script';
import { Fragment } from 'react/jsx-runtime';
import { ENV } from '@/configs/env';

const GA_ID = ENV.google.analyticsId;

export default function GoogleAnalytics() {
    if (!GA_ID) return null;

    return (
        <Fragment>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                `}
            </Script>
        </Fragment>
    );
}
