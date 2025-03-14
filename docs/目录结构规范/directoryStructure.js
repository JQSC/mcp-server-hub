/**
 * @file 统计项目目录结构并以JSON格式输出
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取 __dirname 和 __filename 的等效值
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 检查路径是否匹配指定的目录模式
 * @param {string} dirPath - 要检查的路径
 * @param {Array<string>} patterns - 目录模式列表
 * @returns {boolean} 是否匹配
 */
function isPathMatching(dirPath, patterns) {
  if (!patterns || patterns.length === 0) {
    return false
  }

  const normalizedPath = path.normalize(dirPath).replace(/\\/g, '/')
  const dirName = path.basename(normalizedPath)
  const relativePath = path.relative(process.cwd(), dirPath).replace(/\\/g, '/')

  return patterns.some((pattern) => {
    // 直接匹配目录名
    if (pattern === dirName) {
      return true
    }

    // 匹配路径结尾
    if (normalizedPath.endsWith(`/${pattern}`)) {
      return true
    }

    // 匹配完整路径
    if (relativePath === pattern) {
      return true
    }

    // 匹配路径前缀
    if (relativePath.startsWith(`${pattern}/`)) {
      return true
    }

    return false
  })
}

/**
 * 获取目录结构
 * @param {string} dirPath - 目录路径
 * @param {Object} options - 配置选项
 * @param {number} options.depth - 当前深度
 * @param {number} options.maxDepth - 最大深度
 * @param {Array<string>} options.ignore - 忽略的文件或目录
 * @param {boolean} options.onlyDirs - 是否只统计目录
 * @param {Array<string>} options.onlyDirsIn - 在指定路径中只统计目录
 * @returns {Object} 目录结构对象
 */
function getDirStructure(dirPath, options = {}) {
  const { depth = 0, maxDepth = 10, ignore = [], onlyDirs = false, onlyDirsIn = [] } = options

  // 防止递归过深
  if (depth > maxDepth) {
    return { type: 'dir', name: path.basename(dirPath), note: '达到最大深度限制' }
  }

  try {
    const stats = fs.statSync(dirPath)

    if (!stats.isDirectory()) {
      return {
        type: 'file',
        name: path.basename(dirPath),
        size: `${(stats.size / 1024).toFixed(1)}KB`,
        lastModified: stats.mtime
      }
    }

    // 检查当前目录是否在 onlyDirsIn 列表中
    const isOnlyDirsPath = isPathMatching(dirPath, onlyDirsIn)

    // 当前目录是否只统计目录
    const shouldOnlyIncludeDirs = onlyDirs || isOnlyDirsPath

    const items = fs.readdirSync(dirPath)
    const children = []

    for (const item of items) {
      // 忽略特定文件或目录
      if (
        ignore.some((pattern) => {
          if (pattern.startsWith('*')) {
            return item.endsWith(pattern.slice(1))
          }
          return item === pattern
        })
      ) {
        continue
      }

      const itemPath = path.join(dirPath, item)
      try {
        const itemStats = fs.statSync(itemPath)

        if (itemStats.isDirectory()) {
          children.push(
            getDirStructure(itemPath, {
              depth: depth + 1,
              maxDepth,
              ignore,
              onlyDirs,
              onlyDirsIn
            })
          )
        } else if (!shouldOnlyIncludeDirs) {
          // 只有当不是只统计目录时，才添加文件
          children.push({
            type: 'file',
            name: item,
            size: `${(itemStats.size / 1024).toFixed(1)}KB`,
            lastModified: itemStats.mtime
          })
        }
      } catch (err) {
        if (!shouldOnlyIncludeDirs) {
          children.push({
            type: 'unknown',
            name: item,
            error: err.message
          })
        }
      }
    }

    return {
      type: 'dir',
      name: path.basename(dirPath),
      children: children.sort((a, b) => {
        // 目录排在前面
        if (a.type === 'dir' && b.type !== 'dir') return -1
        if (a.type !== 'dir' && b.type === 'dir') return 1
        // 按名称排序
        return a.name.localeCompare(b.name)
      })
    }
  } catch (err) {
    return {
      type: 'error',
      name: path.basename(dirPath),
      error: err.message
    }
  }
}

/**
 * 主函数 - 获取项目目录结构
 * @param {string} projectPath - 项目根路径
 * @param {Object} options - 配置选项
 * @returns {string} JSON格式的目录结构
 */
function getProjectStructure(projectPath, options = {}) {
  const {
    maxDepth = 10,
    ignore = ['node_modules', '.git', '.v6_cache', '.swc', '.DS_Store', '*.log'],
    pretty = true,
    onlyDirs = false,
    onlyDirsIn = ['src']
  } = options

  const structure = getDirStructure(projectPath, {
    maxDepth,
    ignore,
    onlyDirs,
    onlyDirsIn
  })
  return JSON.stringify(structure, null, pretty ? 2 : 0)
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const projectPath = process.argv[2] || path.resolve(__dirname, '../../../')
  const options = {
    maxDepth: parseInt(process.argv[3]) || 10,
    pretty: true,
    onlyDirsIn: ['src']
  }

  const structure = getProjectStructure(projectPath, options)
  console.log(structure)
}

export { getDirStructure, getProjectStructure }
