// @ts-check

import { defineScriptConfig } from 'nhb-scripts';

export default defineScriptConfig({
    commit: {
        runFormatter: false,
        emojiBeforePrefix: true,
        commitTypes: {
            custom: [{ type: 'types', emoji: '🔧' }],
        },
    },
    count: {
        defaultPath: '.',
        excludePaths: ['node_modules', 'dist', 'build'],
    },
});
