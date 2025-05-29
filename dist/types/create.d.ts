/**
 * 复制目录
 * @param {Array|Object}                                dirList   复制列表
 * @param {String}                                      [name]  默认项目名称
 * @param {function({install, name, app, pack})}        [pack]  默认项目名称
 */
export default function createManager(dirList: any[] | any, { name, pack }?: string): void;
export namespace FileManager {
    /**
     * 复制文件或目录
     * @param {string|Array|Object} src 源路径（文件或目录）、路径列表或映射对象
     * @param {string} dest 目标路径
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    function copy(src: string | any[] | any, dest: string, overwrite?: boolean): void;
    /**
     * 复制单个文件或目录
     * @param {string} src 源路径
     * @param {string} dest 目标路径
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    function _copySingle(src: string, dest: string, overwrite: boolean): void;
    /**
     * 复制目录
     * @param {string} src 源目录
     * @param {string} dest 目标目录
     */
    function _copyDirectory(src: string, dest: string): void;
    /**
     * 复制文件
     * @param {string} src 源文件
     * @param {string} dest 目标文件
     */
    function _copyFile(src: string, dest: string): void;
    /**
     * 批量复制文件或目录
     * @param {Array<string>} paths 路径列表
     * @param {string} destDir 目标目录
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    function _copyMultiple(paths: Array<string>, destDir: string, overwrite: boolean): void;
    /**
     * 复制映射对象中的文件或目录
     * @param {Object} map 源路径到目标路径的映射
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    function _copyMap(map: any, overwrite: boolean): void;
}
