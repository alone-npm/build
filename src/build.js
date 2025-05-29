import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import {builtinModules} from "module";
import path from "path";

/**
 * rollup 构建
 * @param {String}            output     输出目录
 * @param {Object}           [config]    配置信息
 * @param {function|boolean} [external]  外部依赖
 * @param {boolean|Object}   [es]        输出es
 * @param {boolean|Object}   [cjs]       输出cjs
 * @param {boolean|Object}   [umd]       输出umd
 */
export default function (output, {config, external, es, cjs, umd} = {}) {
    const configArray = [];
    const getParam = ({output, config, external, es, cjs, umd} = {}) => {
        return {
            output: typeof output === "undefined" ? 'dist' : output,
            config: (typeof config !== "object") ? {} : config,
            external: typeof external === "undefined" ? true : external,
            es: typeof es === "undefined" ? true : es,
            cjs: typeof cjs === "undefined" ? true : cjs,
            umd: typeof umd === "undefined" ? true : umd
        }
    };
    const buildWay = (input, {output, config, external, es, cjs, umd} = {}) => {
        const formatList = ["es", "cjs", "umd"];
        const param = {...getParam({output, config, external, es, cjs, umd})};
        const options = {input: input, plugins: [resolve(), commonjs(), terser()]};
        const externalCall = (id, file, type) => {
            if (id.endsWith(file)) return false;
            if (type === "umd") return false;
            if (id.startsWith("./") || id.startsWith("../")) return true;
            if (builtinModules.includes(id)) return true;
            return /node_modules/.test(id);
        }
        formatList.forEach((key) => {
            if (param[key]) {
                const objectConfig = {
                    ...options,
                    output: {
                        ...{dir: param.output + '/' + key, format: key, exports: 'named'},
                        ...(typeof param[key] === 'object' ? param[key] : {})
                    }
                };
                if (key === 'umd') {
                    objectConfig.output.name = path.basename(input, '.js');
                }
                if (param.external === true) {
                    objectConfig.external = (id) => externalCall(id, input, key)
                } else if (typeof param.external === 'function') {
                    objectConfig.external = (id) => (param.external)(id, input, key, () => externalCall(id, input, key))
                }
                configArray.push({...objectConfig, ...param.config});
            }
        });
        return configArray;
    }
    const param = {...getParam({output, config, external, es, cjs, umd})};
    return {
        /**
         * 设置构建方式
         * @param {Object|Array|String} input       文件位置
         * @param {Object}              [config]    配置信息
         * @param {function|boolean}    [external]  外部依赖
         * @param {boolean|Object}      [es]        输出es
         * @param {boolean|Object}      [cjs]       输出cjs
         * @param {boolean|Object}      [umd]       输出umd
         */
        set(input, {config, external, es, cjs, umd} = {}) {
            if (typeof input === "object") {
                if (Array.isArray(input)) {
                    input.forEach((key) => this.set(key));
                } else {
                    Object.keys(input).forEach((key) => this.set(key, input[key]));
                }
            } else {
                buildWay(input, {
                    output: param.output,
                    config: typeof config === "undefined" ? param.config : config,
                    external: typeof external === "undefined" ? param.external : external,
                    es: typeof es === "undefined" ? param.es : es,
                    cjs: typeof cjs === "undefined" ? param.cjs : cjs,
                    umd: typeof umd === "undefined" ? param.umd : umd,
                });
            }
            return this;
        },
        /**
         * 获取构建配置
         */
        get() {
            return configArray;
        }
    }
};