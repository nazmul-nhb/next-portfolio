'use client';

import { isString } from 'nhb-toolbox';
import CopyButton from '@/components/misc/copy-button';

type Props = {
    title: string;
    value: string | number | bigint;
    successMsgPrefix: string;
    extra?: string;
};

export default function DecodedRow({ successMsgPrefix, title, value, extra }: Props) {
    const textToCopy = isString(value) ? value : String(value);

    return (
        <div className="border-t dark:border-gray-700 pt-3 flex items-start flex-wrap gap-2 justify-between">
            <div>
                <div className="font-semibold text-gray-600 dark:text-gray-400">{title}</div>
                <div className="font-mono break-all mt-1 text-xs">
                    {textToCopy} {extra && `(${extra})`}
                </div>
            </div>
            <CopyButton
                size="icon-sm"
                successMsg={`${successMsgPrefix} copied to clipboard!`}
                textToCopy={textToCopy}
            />
        </div>
    );
}
