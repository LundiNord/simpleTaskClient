import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-polyfill-node';

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
            drop_console: false
        }
    })
];
const onwarn = (warning, warn) => {
    if (warning.code === 'THIS_IS_UNDEFINED') return;
    warn(warning);
};

export default [ {
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
        input: 'src/notes.ts',
        output: {
            file: 'dist/notesBundle.js',
            format: 'es',
            sourcemap: true,
            sourcemapFile: 'dist/notesBundle.js.map',
            intro: 'const global = typeof window !== "undefined" ? window : this;'
        },
        plugins,
        onwarn,
    },
];
