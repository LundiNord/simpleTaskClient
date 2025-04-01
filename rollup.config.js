import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import alias from '@rollup/plugin-alias';

export default {
    input: 'src/tasks.ts',
    output: {
        file: 'dist/bundle.js',
        format: 'es',
        sourcemap: true,
        sourcemapFile: 'dist/bundle.js.map',
        intro: 'const global = typeof window !== "undefined" ? window : this;'
    },
    plugins: [
        nodePolyfills({
            include: ['buffer', 'process', 'util', 'stream', 'events', 'path', 'http', 'https', 'url']
        }),
        alias({
            entries: [
                {
                    find: 'debug',
                    replacement: './node_modules/debug/src/browser.js'
                },
                {
                    find: 'base-64',
                    replacement: './node_modules/base-64/base64.js'
                }
            ]
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
            }
        }),
        terser({
            format: {
                comments: false
            },
            compress: {
                drop_console: false
            }
        })
    ],
    onwarn(warning, warn) {
        if (warning.code === 'THIS_IS_UNDEFINED') return;
        warn(warning);
    }
};
