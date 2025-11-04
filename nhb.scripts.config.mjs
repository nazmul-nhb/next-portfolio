// @ts-check

import { defineScriptConfig } from 'nhb-scripts';

export default defineScriptConfig({
    commit: {
        runFormatter: false,
        emojiBeforePrefix: true,
    },
    count: {
        defaultPath: '.',
        excludePaths: ['node_modules', 'dist', 'build'],
    },
});
