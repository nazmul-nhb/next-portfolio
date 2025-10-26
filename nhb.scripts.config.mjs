// @ts-check

import { defineScriptConfig } from 'nhb-scripts';

export default defineScriptConfig({
    commit: {
        runFormatter: false,
    },
    count: {
        defaultPath: '.',
        excludePaths: ['node_modules', 'dist', 'build'],
    },
});
