import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
    input: 'src/tasksList.ts',
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
