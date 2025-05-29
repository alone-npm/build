/**
 * rollup 构建
 * @param {String}            output     输出目录
 * @param {Object}           [config]    配置信息
 * @param {function|boolean} [external]  外部依赖
 * @param {boolean|Object}   [es]        输出es
 * @param {boolean|Object}   [cjs]       输出cjs
 * @param {boolean|Object}   [umd]       输出umd
 */
export default function _default(output: string, { config, external, es, cjs, umd }?: any): {
    /**
     * 设置构建方式
     * @param {Object|Array|String} input       文件位置
     * @param {Object}              [config]    配置信息
     * @param {function|boolean}    [external]  外部依赖
     * @param {boolean|Object}      [es]        输出es
     * @param {boolean|Object}      [cjs]       输出cjs
     * @param {boolean|Object}      [umd]       输出umd
     */
    set(input: any | any[] | string, { config, external, es, cjs, umd }?: any): /*elided*/ any;
    /**
     * 获取构建配置
     */
    get(): any[];
};
