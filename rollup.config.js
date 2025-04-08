import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import css from "rollup-plugin-import-css";
import copy from 'rollup-plugin-copy';

const plugins = [
    nodePolyfills({
        include: ['buffer', 'process', 'util', 'stream', 'events', 'path', 'http', 'https', 'url']
    }),
    resolve({
        browser: true,
        preferBuiltins: false,
        mainFields: ['browser', 'module', 'main']
    }),
    commonjs({
        transformMixedEsModules: true,
        requireReturnsDefault: 'auto',
        ignoreTryCatch: false
    }),
    json(),
    typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: {
            declaration: false,
            target: 'es2017',
            module: 'ESNext'
        },
        include: ["src/**/*.ts"],
    }),
    terser({
        format: {
            comments: false
        },
        compress: {
            drop_console: false //ToDo change to true for production
        }
    }),
];
const onwarn = (warning, warn) => {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
};

export default [ {
    //Main JS file for tasks
    input: 'src/tasksList.ts',
    output: {
        file: 'dist/taskBundle.js',
        format: 'es',
        sourcemap: true,
        sourcemapFile: 'dist/taskBundle.js.map',
        intro: 'const global = typeof window !== "undefined" ? window : this;'
    },
    plugins,
    onwarn,
    },
    {
        //Main JS file for notes
        input: 'src/notes.ts',
        output: {
            file: 'dist/notesBundle.js',
            format: 'es',
            sourcemap: true,
            sourcemapFile: 'dist/notesBundle.js.map',
            intro: 'const global = typeof window !== "undefined" ? window : this;'
        },
        plugins: [...plugins,
            css({
                minify: true,
                inject: true,
        }),
            copy({
                targets: [
                    {
                        src: 'node_modules/@fortawesome/fontawesome-free/webfonts/*',
                        dest: 'webfonts'
                    }
                ]
            })
        ],
        onwarn,
    },
    {
        //auxiliary JS file for code note editor
        input: 'src/codeMirror.ts',
        output: {
            file: 'dist/codeMirrorBundle.js',
            format: 'es',
            sourcemap: true,
            sourcemapFile: 'dist/codeMirrorBundle.js.map',
            intro: `
            const global = typeof window !== "undefined" ? window : this;
            // Create a wrapper to isolate variables from global scope
            (function() {
            `,
            outro: '})();',
        },
        plugins,
        onwarn,
    },
    {
        //auxiliary JS file for block note editor
        input: 'src/editorJS.ts',
        output: {
            file: 'dist/editorJSBundle.js',
            format: 'iife',
            sourcemap: true,
            sourcemapFile: 'dist/editorJSBundle.js.map',
            intro: `
            const global = typeof window !== "undefined" ? window : this;
            // Create a wrapper to isolate variables from global scope
            (function() {
            `,
            outro: '})();',
        },
        plugins,
        onwarn,
    },
];
