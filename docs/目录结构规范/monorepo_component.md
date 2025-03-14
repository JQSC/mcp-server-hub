# Monorepo 组件库工程结构规范

## 概述
组件包为多个独立发布的组件包（各个有相关性，同一业务功能的独立部分，需要一起迭代）的总包时，使用下图文件结构。

> **注意**：使用该模式前，需要充分考虑可以不分包，用一个包进行开发。

## 适用场景
- 多个相关性强的组件需要一起迭代
- 组件之间有共享的依赖或工具
- 需要统一管理版本和发布流程

## Monorepo 组件库工程结构

```
[components-package]
├── 配置文件
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .prettierrc.js
│   ├── babel.config.js
│   ├── jest.config.js
│   └── webpack.config.js
├── 文档文件
│   ├── CHANGELOG.md
│   └── README.md
├── node_modules
├── package-lock.json
├── package.json
├── packages                 ## 子包目录
│   └── [component-package]  ## 独立组件包
│       ├── README.md
│       ├── package-lock.json
│       ├── package.json
│       ├── dist             ## 打包输出
│       │  ├── es            ## ES模块
│       │  │   ├── index.js
│       │  │   └── index.d.ts
│       │  ├── lib           ## CommonJS模块
│       │  │   └── index.js
│       │  └── umd           ## UMD模块
│       │      └── index.js
│       ├── demo             ## 示例代码
│       │   └── index.ts
│       ├── __tests__        ## 测试文件
│       │   └── [Component].test.tsx
│       ├── src              ## 源代码
│       │   ├── services     ## 接口服务
│       │   ├── common       ## 公共资源
│       │   │   └── js
│       │   │       ├── async-throw-error.ts
│       │   │       └── axios
│       │   │           └── index.ts
│       │   ├── components   ## 组件代码
│       │   │   ├── [Component]
│       │   │   │   ├── [SubComponent].test.tsx
│       │   │   │   ├── [SubComponent].tsx
│       │   │   │   ├── __tests__
│       │   │   │   │   └── [SubComponent].test.tsx
│       │   │   │   ├── index.less
│       │   │   │   └── index.tsx
│       │   │   └── _utils
│       │   │       ├── [util].ts
│       │   │       └── index.ts
│       │   ├── hooks        ## 自定义hooks
│       │   ├── index.less   ## 样式入口
│       │   ├── index.tsx    ## 组件入口
│       │   └── types        ## 类型定义
│       └── tsconfig.json    ## TypeScript配置
├── scripts                  ## 构建脚本
└── types                    ## 全局类型定义
```

## 注意事项
1. 每个子包保持独立的版本管理和发布
2. 子包内部结构与单组件包结构保持一致
3. 共享的依赖应放在根目录的package.json中
4. 使用lerna或yarn/npm workspaces管理多包工作区