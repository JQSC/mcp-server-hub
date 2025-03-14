# 单组件包工程结构规范

## 概述
本规范适用于单个独立组件包的开发，提供了标准的目录结构和命名规范，以确保代码组织的一致性和可维护性。

## 单组件包工程结构

```
[component-package]
├── 配置文件
│   ├── .eslintrc.js
│   ├── .gitignore
│   ├── .prettierrc.js
│   ├── babel.config.js
│   ├── jest.config.js
│   └── rollup.config.js
├── 文档文件
│   ├── CHANGELOG.md
│   └── README.md
├── dist                     ## 打包输出目录
│   ├── es                   ## ES模块
│   │   ├── index.js
│   │   └── index.d.ts
│   ├── lib                  ## CommonJS模块
│   │   └── index.js
│   └── umd                  ## UMD模块
│       └── index.js
├── demo                     ## 示例代码
│   ├── BasicUsage.tsx       ## 基础用法示例
│   └── AdvancedUsage.tsx    ## 高级用法示例
├── node_modules
├── package-lock.json
├── package.json
├── src                      ## 源代码
│   ├── services             ## 接口服务
│   ├── common               ## 公共资源
│   │   └── js
│   │       ├── async-throw-error.ts
│   │       └── axios
│   │           └── index.ts
│   ├── components           ## 组件代码
│   │   ├── [Component]      ## UI组件（大驼峰命名）
│   │   │   ├── [SubComponent].test.tsx
│   │   │   ├── [SubComponent].tsx
│   │   │   ├── __tests__
│   │   │   │   └── [Component].test.tsx
│   │   │   ├── index.less
│   │   │   └── index.tsx
│   │   └── _utils           ## 工具函数
│   │       ├── [util].ts
│   │       └── index.ts
│   ├── index.less           ## 样式入口
│   ├── hooks                ## 自定义hooks
│   ├── index.ts             ## 组件入口
│   └── types                ## 类型定义
├── __tests__                ## 测试文件
│   └── index.test.ts
├── tsconfig.json            ## TypeScript配置
└── types                    ## 全局类型定义
```

## 命名规范

### 文件夹命名规则

#### [Component] 
- **PascalCase（大驼峰）**：表示当前文件夹为UI组件文件夹
- **其他情况(非大驼峰)**：表示当前文件夹为js模块文件夹

#### 常见模块命名示例
- **useXxx**：hook函数（如useSearch，useAjax）
- **withXxx**：HOC封装函数（如withSearch）
- **xxxStore**：状态管理store
  - 只在[Component]组件内使用的store，不需要在src/components单独成文件夹
  - 多个[Component]公用的store、导出到组件包外的使用store的才在src/components下创建文件夹
- **其他普通函数**：如searchFindItems，为一般js业务函数
  - 只在[Component]组件内使用的函数，不需要在src/components单独成文件夹
  - 多个[Component]公用函数、导出到组件包外的使用的函数才在src/components下创建文件夹

## 最佳实践
1. 保持组件的单一职责，避免过度复杂的组件设计
2. 相关的功能和资源应放在一起，便于维护
3. 公共代码应提取到适当的位置，避免重复
4. 测试文件应与被测试的组件放在一起或在专门的测试目录中