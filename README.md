# TypeScript web monorepo template

用于在 monorepo 架构下快速开发 web 应用的模版项目。

## 设计思路

出于社区环境对 `exports`、`conditions` 等新特性的支持，我们已经可以使用一套全新的方式去架构我们的 monorepo 项目。

基于以下几点：

- 通过 `tsconfig.json` 的 `references` 来管理不同类型文件的类型相关规则
- 针对于多样化包出口的需求，可采用 `exports` 配合支持的 condition 来实现
- 同时对于不同的测试需求，这里也通过 tsconfig 中的相关约束进行配置生成

如此便能实现我们的全新的设计思路。

## 项目规范

项目整体依赖部分约束，建议开发过程中按照相应的规则进行调整。

### 项目结构

本项目侧重于类型系统如何在 monorepo 中进行管理，首先我们看到 tsconfigs 目录，我们从不同种类的文件进行划分：

- 运行在浏览器

  对于这种情况，假设大部分用户正在使用 Bundler 工具：Webpack、Vite 等对自己的代码进行开发。

  - `.browser.ts` 结尾以及 website 目录下为浏览器环境
  - `.browser.spec.ts` 结尾的为模拟浏览器环境
  - 使用 `moduleResolution: bundler` 激活 bundler 场景下的导出策略
  - 添加 `browser` 的 conditional 用于激活特定的 export，针对于浏览器环境你还有需要的 conditional 可以自行添加
  - 添加 `dom` 的 lib 用于激活浏览器环境下的类型支持，如果你有其他的需求，可以自行添加
- 运行在 Node.js

  Node.js 环境本项目使用了 `esbuild-register` 进行编译，所以并没有具体的 bundler，但是因为这里我们选择了 Vitest 作为测试工具，而 Vitest 恰恰基于 Vite，所以关于单元测试实际上是基于 bundler 的。

  不过虽然我们的直接运行的 ts 并没有 bundler，但是实际上来说 Node.js 18 已经支持了 `exports` 的特性，所以我们可以通过 `exports` 来进行导出。

  - 配置文件，比如 `vitest.config.ts` 等。这些文件实际上的运行环境是 Node.js，所以这里我们也分类为该运行时
  - `.node.ts` 结尾以及 apis 目录下为 Node.js 环境
  - `.node.spec.ts` 结尾的为测试环境
  - 添加 `node` 的 conditional 用于激活特定的 export，针对于 Node.js 环境你还有需要的 conditional 可以自行添加

- 俩者皆可运行

  有些代码可能会在浏览器和 Node.js 环境下都会运行，对于不满足上述规则的都可以归类于此。
