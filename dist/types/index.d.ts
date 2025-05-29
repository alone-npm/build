#!/usr/bin/env node --no-warnings --no-deprecation
/**
 * 递归获取文件夹下的所有文件
 * @param {string} dir 文件夹路径
 * @param {string|string[]} [filter] 文件格式过滤器，如 "js,vue" 或 ["js", "vue"]
 * @param {boolean} [exclude=false] 是否排除 filter 指定的格式
 * @param {string} [baseDir=dir] 基础路径，用于计算相对路径
 * @returns {Object} 相对路径 => 绝对路径的对象
 */
export function gitDirList(dir: string, filter?: string | string[], exclude?: boolean, baseDir?: string): any;
