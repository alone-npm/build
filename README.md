## package.json

```json
{
  "name":"your-package-name",
  "version":"1.0.0",
  "type":"module",
  "license":"license",
  "devDependencies":{
    "alone-build":"git+http://git.cn/alone-npm/build",
    "@rollup/plugin-commonjs":"^28.0.3",
    "@rollup/plugin-node-resolve":"^16.0.1",
    "@rollup/plugin-terser":"^0.4.4",
    "@rollup/plugin-typescript":"^12.1.2",
    "javascript-obfuscator":"^4.1.1",
    "typescript":"^5.8.3",
    "rollup":"^4.40.2",
    "tslib":"^2.8.1"
  },
  "scripts":{
    "file":"alone-build",
    "build":"rm -rf ./dist/ && rollup -c && tsc",
    "code":"rm -rf ./dist/ && rollup -c && javascript-obfuscator ./dist/ --output ./build && rm -rf ./dist/ && mv ./build ./dist && tsc"
  }
}
```

* 要安装的依赖包

```
pnpm install tslib typescript @rollup/plugin-typescript rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-terser javascript-obfuscator -D
```

## 安装命令

```
npm install -D git+http://git.cn/alone-npm/build
```

```
pnpm install -D git+http://git.cn/alone-npm/build
```

```
yarn add -D git+http://git.cn/alone-npm/build
```

```
bun install -D git+http://git.cn/alone-npm/build
```

## 执行安装命令

* 生成配置`alone.build.js`和相关开发文件

```
alone-build
```

```
npx alone-build
```

## 打包命令

* 执行 `pnpm file ` 生成打包配置文件
* 执行 `pnpm build` 打包代码目录(代码未混淆)
* 执行 `pnpm code`  打包代码目录(代码混淆)

## 目录说明

* `dist`         为打包代码目录
* `dist/cjs`     为打包的cjs格式的代码目录 使用 ES Module 引入
* `dist/esm`     为打包的esm格式的代码目录 使用 CommonJS 引入
* `dist/umd`     为打包的umd格式的代码目录 使用 script src 引入
* `dist/types`   为打包的types格式的代码目录

## 手写方法

```javascript
import rollupBuild from "alone-build/build";

const rollup = rollupBuild('dist', {umd: {exports: "default"}, config: {}, external: true, es: true, cjs: true});

rollup.set("src/cacheManager.js", {config, external, es, cjs, umd});
rollup.set("src/socketFrame.js", {config, external, es, cjs, umd});
rollup.set("src/urlManager.js", {config, external, es, cjs, umd});

export default rollup.get();
```

```javascript
import rollupBuild from "alone-build/build";

const rollup = rollupBuild('dist', {umd: {exports: "default"}});

rollup.set(["src/cacheManager.js", "src/socketFrame.js", "src/urlManager.js"]);

export default rollup.get();
```

```javascript
import rollupBuild from "alone-build/build";

const rollup = rollupBuild('dist');

rollup.set({
    "src/cacheManager.js": {umd: {exports: "default"}},
    "src/socketFrame.js": {umd: {exports: "default"}},
    "src/urlManager.js": {umd: {exports: "default"}}
});

export default rollup.get();
```