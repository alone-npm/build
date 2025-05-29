import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs';

/**
 * 文件系统助手类
 */
export const FileManager = {
    /**
     * 复制文件或目录
     * @param {string|Array|Object} src 源路径（文件或目录）、路径列表或映射对象
     * @param {string} dest 目标路径
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    copy(src, dest, overwrite = false) {
        if (typeof src === 'string') {
            this._copySingle(src, dest, overwrite);
        } else if (Array.isArray(src)) {
            this._copyMultiple(src, dest, overwrite);
        } else if (typeof src === 'object') {
            this._copyMap(src, overwrite);
        }
    },

    /**
     * 复制单个文件或目录
     * @param {string} src 源路径
     * @param {string} dest 目标路径
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    _copySingle(src, dest, overwrite) {
        if (!fs.existsSync(src)) return;
        if (fs.existsSync(dest) && !overwrite) return;
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
            this._copyDirectory(src, dest);
        } else if (stat.isFile()) {
            this._copyFile(src, dest);
        }
    },

    /**
     * 复制目录
     * @param {string} src 源目录
     * @param {string} dest 目标目录
     */
    _copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, {recursive: true});
        }
        const items = fs.readdirSync(src);
        for (const item of items) {
            const srcPath = path.join(src, item);
            const destPath = path.join(dest, item);
            this._copySingle(srcPath, destPath, true); // 递归复制时默认覆盖
        }
    },

    /**
     * 复制文件
     * @param {string} src 源文件
     * @param {string} dest 目标文件
     */
    _copyFile(src, dest) {
        fs.copyFileSync(src, dest);
    },

    /**
     * 批量复制文件或目录
     * @param {Array<string>} paths 路径列表
     * @param {string} destDir 目标目录
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    _copyMultiple(paths, destDir, overwrite) {
        for (const src of paths) {
            const dest = path.join(destDir, path.basename(src));
            this._copySingle(src, dest, overwrite);
        }
    },

    /**
     * 复制映射对象中的文件或目录
     * @param {Object} map 源路径到目标路径的映射
     * @param {boolean} overwrite 目标存在时是否覆盖
     */
    _copyMap(map, overwrite) {
        for (const [src, dest] of Object.entries(map)) {
            this._copySingle(src, dest, overwrite);
        }
    },
};

/**
 * 复制目录
 * @param {Array|Object}                                dirList   复制列表
 * @param {String}                                      [name]  默认项目名称
 * @param {function({install, name, app, pack})}        [pack]  默认项目名称
 */
export default function createManager(dirList, {name = "projectPackage", pack = (() => null)} = {}) {
    //安装目录
    const installDir = path.dirname(fileURLToPath(import.meta.url));
    //目录名称
    const dirName = process.argv[2] || name;
    //用户目录
    const appDir = path.resolve(process.cwd(), dirName);
    //复制目录
    FileManager.copy(path.resolve(installDir, "pack"), path.resolve(appDir, "pack"), true);
    if (typeof dirList === 'object') {
        if (Array.isArray(dirList)) {
            dirList.forEach(key => {
                FileManager.copy(path.resolve(installDir, key), path.resolve(appDir, key), true);
            });
        } else {
            Object.keys(dirList).forEach(key => {
                FileManager.copy(path.resolve(installDir, key), path.resolve(appDir, dirList[key]), true);
            });
        }
    }
    (pack && typeof pack === 'function') && pack({
        install: installDir, name: dirName, app: appDir, pack: {
            /**
             * package.json文件
             */
            file: path.resolve(process.cwd(), "package.json"),

            /**
             * 是否存在
             * @returns {boolean}
             */
            is() {
                return fs.existsSync(this.file);
            },
            /**
             * 获取package.json文件内容
             * @returns {any|{}}
             */
            get() {
                return this.is() ? JSON.parse((fs.readFileSync(this.file, 'utf-8') || "{}")) : {};
            },
            /**
             * 保存package.json文件内容
             * @param pack
             */
            save(pack) {
                return fs.writeFileSync(this.file, JSON.stringify(pack, null, 2));
            }
        }
    });
}