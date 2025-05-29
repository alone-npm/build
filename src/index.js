#!/usr/bin/env node --no-warnings --no-deprecation

import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import path from "path";
import fs from "fs";

/**
 * 递归获取文件夹下的所有文件
 * @param {string} dir 文件夹路径
 * @param {string|string[]} [filter] 文件格式过滤器，如 "js,vue" 或 ["js", "vue"]
 * @param {boolean} [exclude=false] 是否排除 filter 指定的格式
 * @param {string} [baseDir=dir] 基础路径，用于计算相对路径
 * @returns {Object} 相对路径 => 绝对路径的对象
 */
export function gitDirList(dir, filter, exclude = false, baseDir = dir) {
    const fileObject = {};
    // 检查目录是否存在
    if (!fs.existsSync(dir)) return fileObject;
    // 将 filter 转换为数组
    const filterArray = typeof filter === 'string' ? filter.split(',') : filter || [];
    // 读取目录内容
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // 如果是目录，递归处理
            const subDirFiles = gitDirList(filePath, filter, exclude, baseDir);
            Object.assign(fileObject, subDirFiles);
        } else if (stat.isFile()) {
            // 获取文件扩展名
            const ext = path.extname(file).slice(1); // 去掉点，如 "js"
            // 判断是否满足过滤条件
            const isMatch = filterArray.length === 0 || filterArray.includes(ext);
            const shouldInclude = exclude ? !isMatch : isMatch;
            if (shouldInclude) {
                // 添加到对象中
                const relativePath = path.relative(baseDir, filePath);
                fileObject[relativePath] = filePath;
            }
        }
    });
    return fileObject;
}

function aloneBuild() {
    //删除文件名中的格式
    const removeFileNameExtension = (filePath) => {
        const dir = path.dirname(filePath); // 获取目录部分
        const fileName = path.basename(filePath); // 获取文件名部分
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, ''); // 删除文件名中的格式
        return path.join(dir, fileNameWithoutExt); // 拼接路径和文件名
    }
    const alonePackage = (configFile = "alone.build.js") => {
        return {
            name: process.argv[2],
            config: {
                //开发目录
                input: "src",
                //开发格式
                format: ["js", "ts"],
                //打包目录
                output: "dist",
                //默认使用文件名 如 import nameDemo from "name-demo"; 会默认使用什么js
                main: "index",
                //上传到npm的目录和文件,默认添加打包目录
                files: ["README.md"],
                //打包目录设置,为空不打包
                dist: {es: "es", cjs: "cjs", umd: "", types: "types"},
                //是否更新package.json
                package: true
            },
            //内部参数
            param: {
                //开发目录
                input: "",
                //打包目录
                output: "",
                //默认文件
                main: ""
            },
            aloneConfig() {
                const file = path.resolve(process.cwd(), configFile);
                if (!fs.existsSync(file)) {
                    const content = `import {builtinModules} from "module";

//判断生成的文件是否是外部依赖,file=文件名,types: "es" | "cjs" | "umd"
export const external = (id, file, type) => {
    if (id.endsWith(file)) return false;
    if (type === "umd") return false;
    if (id.startsWith("./") || id.startsWith("../")) return true;
    if (builtinModules.includes(id)) return true;
    return /node_modules/.test(id);
}

export default {
    //开发目录
    input: "src",
    //开发格式
    format: ["js", "ts"],
    //打包目录
    output: "dist",
    //默认使用文件名 如 import nameDemo from "name-demo"; 会默认使用什么js
    main: "index",
    //上传到npm的目录和文件,默认添加打包目录
    files: ["README.md", "tsconfig.json","package.json", "dist"],
    //打包目录设置,为空不打包
    dist: {es: "es", cjs: "cjs", umd: "", types: "types"},
    //是否更新package.json
    package: true
}`;
                    fs.writeFileSync(file, content);
                }
                return this;
            },
            //处理配置
            async dealConfig() {
                const file = path.resolve(process.cwd(), configFile);
                if (fs.existsSync(file)) {
                    const config = (await import(file)) || {};
                    if (config.default && typeof config.default === "object") {
                        Object.assign(this.config, config.default);
                    }
                }
                //开发目录
                this.param.input = path.resolve(process.cwd(), this.config.input);
                //打包目录
                this.param.output = path.resolve(process.cwd(), this.config.output);
                //默认文件
                this.param.main = path.resolve(this.param.input, this.config.main + ".js");
                //上传列表
                this.config.files = this.config.files || [];
                if (!this.config.files.includes(this.config.output)) {
                    this.config.files.push(this.config.output);
                }
                return this;
            },
            //创建默认文件
            mainFile() {
                if (!fs.existsSync(this.param.main)) {
                    const content = `export default ${JSON.stringify(this.config, null, 2)}`;
                    fs.writeFileSync(this.param.main, content);
                }
                return this;
            },
            //生成 .npmignore文件
            npmIgnore(content = "") {
                content = `*\n${this.config.files.length > 0 ? "!" : ""}${this.config.files.join('\n!')}\n${content}`;
                fs.writeFileSync(path.resolve(process.cwd(), '.npmignore'), content);
                return this;
            },
            //生成 .gitignore文件
            gitIgnore(content = "") {
                const file = path.resolve(process.cwd(), '.gitignore');
                content = `.idea\n.vscode\n.DS_Store\nnode_modules\npnpm-lock.yaml\npackage-lock.json\nyarn.lock\nbun.lockb\n${content}`;
                fs.writeFileSync(file, content);
                return this;
            },
            //生成rollup.config.js配置内容
            async rollupConfig() {
                const rollupArray = [];
                let rollupString = `import typescript from '@rollup/plugin-typescript';
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import {external} from "./${configFile}";

export default [`;
                const fileObject = gitDirList(this.param.input, this.config.format || ["js", "ts"]);
                const fileKeys = Object.keys(fileObject);
                const fileLength = fileKeys.length;
                if (fileLength > 0) {
                    for (let i = 0; i < fileLength; i++) {
                        const fileName = fileKeys[i];
                        const filePath = fileObject[fileName];
                        let srcPath = path.dirname(path.relative(this.param.input, filePath));
                        srcPath = srcPath !== '.' ? '/' + srcPath : ''
                        const getString = (outputStr, type) => {
                            return `
                    {
                        input: "${path.relative(process.cwd(), filePath)}",
                        output: [
                        ${outputStr.replace(/\n$/, '').replace(/^,|,$/g, '')}
                        ],
                        plugins: [resolve(), commonjs(), typescript({declaration: false, declarationDir: undefined, outDir: undefined}), terser()],
                        external: (id) => external(id, "${path.relative(process.cwd(), filePath)}", "${type}")
                    },`;
                        }

                        if (this.config.dist.es) {
                            rollupArray.push({
                                input: path.relative(process.cwd(), filePath),
                                output: [{
                                    dir: this.config.output + "/" + this.config.dist.es + srcPath,
                                    format: "es",
                                    exports: "named"
                                }],
                                plugins: [resolve(), commonjs(), typescript({
                                    declaration: false,
                                    declarationDir: undefined,
                                    outDir: undefined
                                }), terser()]
                            });
                            rollupString += getString(`{dir: "${this.config.output}/${this.config.dist.es}${srcPath}",format: "es",exports: "named"}`, 'es');
                        }
                        if (this.config.dist.cjs) {
                            rollupArray.push({
                                input: path.relative(process.cwd(), filePath),
                                output: [{
                                    dir: this.config.output + "/" + this.config.dist.cjs + srcPath,
                                    format: "cjs",
                                    exports: "named"
                                }],
                                plugins: [resolve(), commonjs(), typescript({
                                    declaration: false,
                                    declarationDir: undefined,
                                    outDir: undefined
                                }), terser()]
                            });
                            rollupString += getString(`{dir: "${this.config.output}/${this.config.dist.cjs}${srcPath}",format: "cjs",exports: "named"}`, 'cjs');
                        }
                        if (this.config.dist.umd) {
                            const content = await import(filePath);
                            const keys = Object.keys(content);
                            const exports = (keys.length > 1 || (keys.length === 1 && !keys.includes('default'))) ? 'named' : 'default';
                            rollupArray.push({
                                input: path.relative(process.cwd(), filePath),
                                output: [{
                                    dir: this.config.output + "/" + this.config.dist.umd + srcPath,
                                    format: 'umd',
                                    name: path.basename(fileName, '.js'),
                                    exports: exports
                                }],
                                plugins: [resolve(), commonjs(), typescript({
                                    declaration: false,
                                    declarationDir: undefined,
                                    outDir: undefined
                                }), terser()]
                            });
                            rollupString += getString(`{dir: "${this.config.output}/${this.config.dist.umd}${srcPath}",format: "umd",name: "${path.basename(fileName, '.js')}",exports: "${exports}"}`, 'umd');
                        }
                    }
                }
                return {string: `${rollupString.replace(/^,|,$/g, '')}\n];`, array: rollupArray};
            },
            //生成rollup.config.js配置文件
            async rollupFile() {
                const config = await this.rollupConfig();
                fs.writeFileSync(path.resolve(process.cwd(), 'rollup.config.js'), config.string);
                return this;
            },
            //生成tsconfig.json配置文件
            tsconfig() {
                const file = path.resolve(process.cwd(), 'tsconfig.json');
                let content = {};
                const types = "./" + this.config.output + "/" + (this.config.dist.types || "./@types");
                const typeInclude = types.replace(/\/+$/, "") + "/**/*";
                if (fs.existsSync(file)) {
                    const json = fs.readFileSync(file, 'utf-8');
                    content = JSON.parse(json);
                    content.include = content.include || [];
                    if (!content.include.includes(`${this.config.input}/**/*`)) {
                        content.include.push(`${this.config.input}/**/*`);
                    }
                    content.compilerOptions = content.compilerOptions || {};
                    content.compilerOptions.outDir = types;
                    content.compilerOptions.declarationDir = types;
                    content.compilerOptions.typeRoots = content.compilerOptions.typeRoots || [];
                    if (!content.compilerOptions.typeRoots.includes(types)) {
                        content.compilerOptions.typeRoots.push(types);
                    }
                    content.include = content.include || [];
                    if (!content.include.includes(typeInclude)) {
                        content.include.push(typeInclude);
                    }
                } else {
                    content = {
                        compilerOptions: {
                            outDir: types,
                            declaration: true,
                            declarationDir: types,
                            typeRoots: ["./node_modules/@types", types],
                            module: "esnext",
                            target: "es2022",
                            moduleResolution: "node",
                            esModuleInterop: true,
                            allowJs: true,
                            emitDeclarationOnly: true,
                            lib: ["es2022", "dom"],
                            skipLibCheck: true,
                            checkJs: false,
                            jsx: "preserve",
                            noImplicitAny: false,
                            importHelpers: true
                        },
                        include: [`${this.config.input}/**/*`, typeInclude]
                    };
                }
                fs.writeFileSync(file, JSON.stringify(content, null, 2));
                return this;
            },
            package(config = {}) {
                if (this.config.package === false) return this;
                const file = path.resolve(process.cwd(), 'package.json');
                const json = fs.readFileSync(file, 'utf-8');
                const pack = JSON.parse(json);
                pack.files = this.config.files;
                pack.type = pack.type || "module";
                pack.scripts = pack.scripts || {};
                pack.scripts.file = `alone-build`;
                pack.scripts.build = `rm -rf ./${this.config.output}/ && rollup -c && tsc`;
                pack.scripts.code = `rm -rf ./${this.config.output}/ && rollup -c && javascript-obfuscator ./${this.config.output}/ --output ./build && rm -rf ./${this.config.output}/ && mv ./build ./${this.config.output} && tsc`;
                const fileObject = gitDirList(this.param.input, this.config.format || ["js", "ts"]);
                const fileKeys = Object.keys(fileObject);
                const fileLength = fileKeys.length;
                if (fileLength > 0) {
                    pack.exports = {};
                    for (let i = 0; i < fileLength; i++) {
                        const fileName = removeFileNameExtension(fileKeys[i]);
                        const value = {};
                        if (this.config.dist.es) {
                            value.import = `./${this.config.output}/${this.config.dist.es}/${fileName}.js`;
                        }
                        if (this.config.dist.cjs) {
                            value.require = `./${this.config.output}/${this.config.dist.cjs}/${fileName}.js`;
                        }
                        if (this.config.dist.umd) {
                            value.browser = `./${this.config.output}/${this.config.dist.umd}/${fileName}.js`;
                        }
                        if (this.config.dist.types) {
                            value.types = `./${this.config.output}/${this.config.dist.types}/${fileName}.d.ts`;
                        }
                        if (fileName === this.config.main) {
                            pack.exports["."] = value;
                        }
                        pack.exports[`./${fileName}`] = value;
                    }
                }
                const packList = {
                    "@rollup/plugin-commonjs": "^28.0.3",
                    "@rollup/plugin-node-resolve": "^16.0.1",
                    "@rollup/plugin-terser": "^0.4.4",
                    "@rollup/plugin-typescript": "^12.1.2",
                    "javascript-obfuscator": "^4.1.1",
                    "typescript": "^5.8.3",
                    "rollup": "^4.40.2",
                    "tslib": "^2.8.1"
                };
                pack.dependencies = pack.dependencies || {};
                pack.devDependencies = pack.devDependencies || {};
                for (const key in packList) {
                    if (!pack.dependencies.hasOwnProperty(key) && !pack.devDependencies.hasOwnProperty(key)) {
                        pack.devDependencies[key] = packList[key];
                    }
                }
                if (Object.keys(pack.dependencies).length === 0) {
                    delete pack.dependencies;
                }
                if (Object.keys(pack.devDependencies).length === 0) {
                    delete pack.devDependencies;
                }
                fs.writeFileSync(file, JSON.stringify(Object.assign(pack, config || {}), null, 2));
                return this;
            },
            async init() {
                await this.dealConfig();
                (!fs.existsSync(this.param.input)) && fs.mkdirSync(this.param.input, {recursive: true});
                (this.name === 'install') && this.mainFile();
                (!fs.existsSync(path.resolve(process.cwd(), configFile))) && this.aloneConfig();
                (!fs.existsSync(path.resolve(process.cwd(), '.gitignore'))) && this.gitIgnore();
                this.tsconfig();
                this.npmIgnore();
                this.package();
                await this.rollupFile();
            }
        }
    }
    alonePackage("alone.build.js").init();
}

aloneBuild();