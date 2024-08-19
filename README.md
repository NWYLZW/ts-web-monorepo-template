# TypeScript web monorepo template

用于在 monorepo 架构下快速开发 web 应用的模版项目。

## 设计思路

出于社区环境对 `exports`、`conditions` 等新特性的支持，我们已经可以使用一套全新的方式去架构我们的 monorepo 项目。

基于以下几点我选择了以下的设计思路：

- 通过 `tsconfig.json` 的 `references` 来管理不同类型文件的类型相关规则
- 针对于多样化包出口的需求，可采用 `exports` 配合支持的 condition 来实现
