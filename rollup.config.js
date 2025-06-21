import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import {external} from "./alone.build.js";

export default [
                    {
                        input: "src/build.js",
                        output: [
                        {dir: "dist/es",format: "es",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/build.js", "es")
                    },
                    {
                        input: "src/build.js",
                        output: [
                        {dir: "dist/cjs",format: "cjs",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/build.js", "cjs")
                    },
                    {
                        input: "src/create.js",
                        output: [
                        {dir: "dist/es",format: "es",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/create.js", "es")
                    },
                    {
                        input: "src/create.js",
                        output: [
                        {dir: "dist/cjs",format: "cjs",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/create.js", "cjs")
                    },
                    {
                        input: "src/index.js",
                        output: [
                        {dir: "dist/es",format: "es",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/index.js", "es")
                    },
                    {
                        input: "src/index.js",
                        output: [
                        {dir: "dist/cjs",format: "cjs",exports: "named"}
                        ],
                        plugins: [resolve(), commonjs(),terser()],
                        external: (id) => external(id, "src/index.js", "cjs")
                    }
];