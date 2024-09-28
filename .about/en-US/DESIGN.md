# 设计思路

出于社区环境对 `exports`、`conditions` 等新特性的支持，我们已经可以使用一套全新的方式去架构我们的 monorepo 项目。

基于以下几点：

- 通过 `tsconfig.json` 的 `references` 来管理不同类型文件的类型相关规则
- 针对于多样化包出口的需求，可采用 `exports` 配合支持的 condition 来实现
- 同时对于不同的测试需求，这里也通过 tsconfig 中的相关约束进行配置生成

如此便能实现我们的全新的设计思路。

## 项目规范

本项目指在对**类型系统**进行规范借鉴，故在技术栈的选型上主要为示范性作用，很多工具链的配置改造成本较低，如果你需要进行自己的技术选型，建议开发过程中按照相应的规则进行调整。

### 项目结构

本项目侧重于类型系统如何在 monorepo 中进行管理，首先我们看到 `tsconfigs` 目录，我们从不同种类的文件进行划分：

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

  - 配置、脚本文件，比如 `vitest.config.ts` 等。这些文件实际上的运行环境是 Node.js，所以这里我们也分类为该运行时
  - `.node.ts` 结尾以及 apis 目录下为 Node.js 环境
  - `.node.spec.ts` 结尾的为测试环境
  - 添加 `node` 的 conditional 用于激活特定的 export，针对于 Node.js 环境你还有需要的 conditional 可以自行添加

- 俩者皆可运行

  - 有些代码可能会在浏览器和 Node.js 环境下都会运行，对于不满足上述规则的都可以归类于此。
  - 有些非运行时的代码，比如说我们项目中需要共用的类型信息，这部分可能在前端和后端都需要使用，但是并不需要存在相应的运行时约束。这个时候我们可以只共享相应的类型数据而不抽象单独的包或者说模块，这样可以拥有一个更轻量级的兼容层。

出于上述考量，我们就可以按照不同的文件命名规则来划分不同 tsconfig，其次在包中导出依赖的时候根据导出文件的使用范围，合理采用不同的条件导出。

### 工具链

- Linter: [ESLint](https://eslint.org/)

  这里使用 @antfu/eslint-config 作为默认配置，你可以使用 `pnpm dlx @antfu/eslint-config@latest` 调整为你需要的具体项目配置。

  配置文件位置 `eslint.config.mjs`。

- Formatter: [Dprint](https://dprint.dev/)

  这里默认安装与配置了 typescript、json、markdown、toml、css 以及其他的 css 预编译语言的插件，如果有需要可以自行删除安装。

  配置文件位置 `dprint.json`。

## Q&A

Q: 为什么不用 tsconfig paths？

A: 有多点：
- 不够标准为主要原因，由此导致很多 bundler 工具并不默认支持，因此需要用户根据自己的 bundler 去安装相应的插件。
- 在 monorepo 的环境下，如果使用 paths 且存在多份 tsconfig，那么你还需要告诉你的打包器应该用哪个 tsconfig，这样会导致你的打包器的配置变得复杂。
- 没办法利用 conditional exports、imports。导致在部分较为常见场景处理起来不好用，比如无法使用一个路径，根据具体的文件选择不同内容导出。
- 在 monorepo 环境下，如果 tsconfig 的配置复杂，每一个包可能都需要一个 tsconfig，或者有部分包需要一个特殊的 tsconfig，但是 paths 或者 rootdir 或者其他影响路径的配置，都会导致你的 paths 要在每一个这样的场景下复制一遍。

Q: 为什么将单元测试单独分开？

A: 类型污染，单元测试往往会依赖 @types/node 这间接导致你包括了单元测试文件的 tsconfig project 都会被 node 的类型污染，以及其他的类型污染。

参考资料：[Ambient Module Declaration](https://www.typescriptlang.org/docs/handbook/modules/reference.html#:~:text=Ambient%20modules.%20TypeScript%20supports%20a%20syntax%20in%20script)

Q: 为什么不弄多个 tsconfig 在每个包下面？

A: 麻烦，你要写多个，然后不断的 extends，维护成本也很高。不是一种好的实践。

Q: 为什么要有那么多的 tsconfig？

A: 对于一个现代化并完善的前端项目来说，我们必然有几个核心需求

- 写 Bundler(Webpack, Rollup, Vite) 的配置文件
- 写运行在浏览器的前端项目文件
- 写不限制使用范围的文件
- 写单元测试文件

这些并不单单是一个简单的依赖管理就能把所有的问题解决，我们同时还需要认知每一种文件都有自己特定的环境类型，以及文件的模块引入策略条件，乃至于编译选项的配置。所以我们至少需要 3 * 2 个不同的 tsconfig 来管理这些文件。

## 相关

一些朋友在看了本项目后推荐的一些相关资料（没想到也有和我有着类似思考方式的）：

- [tshy](https://github.com/isaacs/tshy)
- [TypeScript Monorepo 的多种实践方式](https://github.com/colinhacks/live-typescript-monorepo)
- [Esbuild 中的 project reference 实践方式](https://github.com/evanw/esbuild/issues/1250#issuecomment-1463826174)

参考资料：

- [Node.js 中的条件导出](https://nodejs.org/api/packages.html#conditional-exports)
- [TypeScript 中的模块解析策略](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option)
