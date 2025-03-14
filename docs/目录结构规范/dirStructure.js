/**
 * @file 项目目录结构统计工具
 */
import path from 'path';
import fs from 'fs';
import { getProjectStructure } from './directoryStructure.js';

/**
 * 解析命令行参数
 * @returns {Object} 解析后的参数
 */
function parseArgs() {
	const args = process.argv.slice(2);
	const options = {
		path: path.resolve(__dirname),
		maxDepth: 10,
		output: null,
		format: 'json',
		ignore: ['node_modules', '.git', '.v6_cache', '.swc', '.DS_Store', '*.log'],
		onlyDirs: false,
		onlyDirsIn: ['src'],
	};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg === '--path' && i + 1 < args.length) {
			options.path = path.resolve(args[++i]);
		} else if (arg === '--depth' && i + 1 < args.length) {
			options.maxDepth = parseInt(args[++i], 10);
		} else if (arg === '--output' && i + 1 < args.length) {
			options.output = path.resolve(args[++i]);
		} else if (arg === '--format' && i + 1 < args.length) {
			options.format = args[++i];
		} else if (arg === '--ignore' && i + 1 < args.length) {
			options.ignore = args[++i].split(',');
		} else if (arg === '--only-dirs' && i + 1 < args.length) {
			options.onlyDirs = args[++i].toLowerCase() === 'true';
		} else if (arg === '--only-dirs-in' && i + 1 < args.length) {
			options.onlyDirsIn = args[++i].split(',');
		} else if (arg === '--help') {
			showHelp();
			process.exit(0);
		}
	}

	return options;
}

/**
 * 显示帮助信息
 */
function showHelp() {
	console.log(`
项目目录结构统计工具

用法:
  node dirStructure.js [选项]

选项:
  --path <路径>         指定要统计的目录路径，默认为当前目录
  --depth <数字>        指定递归深度，默认为10
  --output <文件>       指定输出文件，默认输出到控制台
  --format <格式>       指定输出格式，支持json（默认）
  --ignore <列表>       指定要忽略的文件或目录，用逗号分隔
  --only-dirs <布尔值>  是否只统计目录，默认为false
  --only-dirs-in <列表> 在指定目录中只统计目录，默认为src，用逗号分隔
  --help                显示此帮助信息
  `);
}

/**
 * 主函数
 */
function main() {
	const options = parseArgs();

	try {
		const structure = getProjectStructure(options.path, {
			maxDepth: options.maxDepth,
			ignore: options.ignore,
			pretty: true,
			onlyDirs: options.onlyDirs,
			onlyDirsIn: options.onlyDirsIn,
		});

		if (options.output) {
			fs.writeFileSync(options.output, structure);
			console.log(`目录结构已保存到: ${options.output}`);
		} else {
			console.log(structure);
		}
	} catch (err) {
		console.error('错误:', err.message);
		process.exit(1);
	}
}

// 执行主函数
main();
