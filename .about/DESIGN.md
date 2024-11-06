# 设计思路

## 引

[Monorepo 中基建最关键的部分是如何清晰简单的去定义相互依赖关系。](https://monorepo.tools/#what-is-a-monorepo)

## 面对的问题

开发环境往往是复杂且多样的，比如说：

- 解耦了的部分需要或者可以单独发布的代码：核心、工具、统一定义等
- 通过组合而形成的各种不同情况上层应用：前端 web 界面、后端服务、命令行工具等
- 与工作空间存在一定依赖关系，为了发布同步和维护方便等目的放在一个仓库中进行维护：文档、脚本等

在很多的知名大型项目中他们都采取了 Monorepo 的方式进行管理，但是纵观如此多的项目，他们在一些开发体验上并没有做到极致。我们会面对各种各样的问题：

- tsconfig 配置维护困难
- 方案不够标准导致依赖外部插件
- 源码跳转失效
- 无法细化导出规则：屏蔽、子路径、禁用等

这些问题的根因都是因为我们没有一个标准，那么如何在这些不同的系统之间按照统一的标准将他们的联系建立起来呢？

## 可用的手段

那么在这个全新的时代我们有什么新手段可以解决我们在 Monorepo 开发过程中遇到的各式各样的问题呢？

- [`exports`](https://nodejs.org/api/packages.html#exports)、[`imports`](https://nodejs.org/api/packages.html#imports)、[`conditions`](https://nodejs.org/api/packages.html#conditional-exports) 等导出特性的支持
- `tsconfig` 的 [`references`](https://www.typescriptlang.org/docs/handbook/project-references.html) 提供了对不同类型文件的编译参数控制
- `tsconfig` 的 [`compilerOptions.moduleResolution`](https://www.typescriptlang.org/tsconfig/moduleResolution.html) 支持了 [bundler](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#--moduleresolution-bundler)
- `tsconfig` 的 [`customCondtions`](https://www.typescriptlang.org/tsconfig/#customConditions) 支持了条件导出，可以让用户根据自己的环境使用不同的导出策略
- `vitest` 对于[工作空间](https://vitest.dev/guide/workspace)的支持
- `yarn` 的 [Cross-references](https://yarnpkg.com/features/workspaces#cross-references)、`pnpm` 的 [Workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) 解决工作空间中的依赖管理问题
- 基于 `rollup` 在工作空间的新型构建工具 [jiek](https://github.com/NWYLZW/jiek/blob/master/packages/jiek/README.md)

## 具体设计

首先从多个角度对我们的 Monorepo 进行规划：

- 更准确更可靠更具备扩展性的类型
- 按照文件类型对单元测试进行分类配置
- 基于工作空间的依赖以及导出规则而自然而然的构建发布工具和方式
- 基于 antfu 的 eslint 工具，你可以很简单的定义不同类型文件的校验规则

> 本项目指在对**类型系统**进行规范和给予借鉴，故在技术栈的选型上主要为示范性作用，工具链改造成本较低，如果你需要选择自己的技术，建议开发过程中按照相应的规则进行调整。

### 类型

在上面所谈到的技术出现之前，我们往往会在 monorepo 中面对许多问题：不够标准的 paths 方案、难以维护的 tsconfig 配置、源码跳转的彻底失效、无法使用的条件导出。

那么在这里我们又是如何系统化的解决的问题呢？首先我们可以进行如下的设计：

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

### 构建与发布

当我们在 Monorepo 下面进行工作的时候，一个很关键的点就是管理有什么需要构建，以及建立包之间的依赖关系。所以我们需要几个元数据：

- 定义构建入口，甚至根据一些隐式条件自然而然的控制编译参数
- 定义使用入口，直接与 `exports` 进行映射，开发阶段跳转定义的时候可以直接跳转到源码
- 定义依赖关系，决定什么东西需要 bundle 到产物中，什么是外部依赖
- 定义内部的路径重写，简化跨层级的路径引入

在这里我们充分利用了标准中的字段来进行了设计，在下面我以下面的例子简单进行说明：
```json
{
  "name": "c",
  // 构建入口与使用入口实际上是同构的
  // 我们在开发阶段可以将源码直接设置为入口点，然后按照对应的规则在编译与发布的阶段转化到我们的产物模式
  "exports": {
    // 设置根入口
    ".": "./src/index.ts",
    "./foo": {
      // 当我们的 esm 和 CommonJS 的入口因为一些设计原因导致不一致时，我们可以使用 import 与 require 来进行区分
      // 比如说我们希望 CommonJS 被使用的时候不需要 `require('c').default`
      "import": "./src/foo.mts",
      "require": "./src/foo.ts"
    },
    // 支持 glob 匹配递归下的整个目录树
    "./bar/*": "./src/bar/*.ts",
    "./bor": {
      // 假设你正在写一个组件库，你喜欢用户可以可选的引入带样式，亦或是不带样式的产物
      // 你可以分流为俩个入口，让用户通过 conditional 来控制
      "styless": "./src/bor.styless.ts",
      "default": "./src/bor.ts"
    }
  },
  "imports": {
    // 类似于你在 `tsconfig.compilerOptions.paths` 中写 `"@/*": ["./src/*"]`
    "#/*": "./src/*",
    "#internal/*": "./src/internal/*"
  },
  // 本字段中声明的均不会打包到产物中而是作为外部依赖被引用
  "dependencies": {
    // 通过 workspace 协议定义的工作空间依赖
    // 可以使你不需要再在当前目录创建 tsconfig 定义 references 来重复定义依赖关系
    // 同时在发布时也会自动将内容替换为工作空间下对应
    "a": "workspace:^",
    "foo": "^0.1.0"
  },
  // 开发依赖如果在项目实际使用的过程中被引入了，由于相应的安装特性，内容会被打包到产物之中
  "devDependencies": {
    "b": "workspace:^",
    "bar": "^0.1.0"
  },
  // 与 devDependencies 一致
  "optionalDependecies": {}
}
```

按照你的需求定义好如上的配置，如果没有特殊的需求，我们就不需要写任何相关的编译配置而可以直接通过相关的指令进行编译以及发布，极大地简化了配置文件的编写。

### 工具链

- Linter: [ESLint](https://eslint.org/)

  这里使用 @antfu/eslint-config 作为默认配置，你可以使用 `pnpm dlx @antfu/eslint-config@latest` 调整为你需要的具体项目配置。

  配置文件位置 `eslint.config.mjs`。

- Formatter: [Dprint](https://dprint.dev/)

  这里默认安装与配置了 typescript、json、markdown、toml、css 以及其他的 css 预编译语言的插件，如果有需要可以自行删除安装。

  配置文件位置 `dprint.json`。

## Q&A

- Q: 为什么不用 tsconfig paths？
- A: 有多点：
  - 不够标准为主要原因，由此导致很多 bundler 工具并不默认支持，因此需要用户根据自己的 bundler 去安装相应的插件。
  - 在 monorepo 的环境下，如果使用 paths 且存在多份 tsconfig，那么你还需要告诉你的打包器应该用哪个 tsconfig，这样会导致你的打包器的配置变得复杂。
  - 没办法利用 conditional exports、imports。导致在部分较为常见场景处理起来不好用，比如无法使用一个路径，根据具体的文件选择不同内容导出。
  - 在 monorepo 环境下，如果 tsconfig 的配置复杂，每一个包可能都需要一个 tsconfig，或者有部分包需要一个特殊的 tsconfig，但是 paths 或者 rootdir 或者其他影响路径的配置，都会导致你的 paths 要在每一个这样的场景下复制一遍。

- Q: 为什么将单元测试单独分开？
- A: 类型污染，单元测试往往会依赖 @types/node 这间接导致你包括了单元测试文件的 tsconfig project 都会被 node 的类型污染，以及其他的类型污染。

  参考资料：[Ambient Module Declaration](https://www.typescriptlang.org/docs/handbook/modules/reference.html#:~:text=Ambient%20modules.%20TypeScript%20supports%20a%20syntax%20in%20script)

- Q: 为什么不弄多个 tsconfig 在每个包下面？

- A: 会导致维护起来十分的困难，如果你有在大型 Monorepo 下面工作的经验，你很容易遇到以下一些情况：
  - 每个包下面反复去[配置相同](https://github.com/web-infra-dev/rspack/blob/0db8b9441a8bf9447ce11cc69292df773482cec8/packages/rspack-cli/tsconfig.json#L3-L9)的 tsconfig 编译参数
  - 哪怕你在 package.json 下面已经声明了当前包的工作空间内的依赖，你同样还是需要在包下面 tsconfig 中[引用对应 project 的目录](https://github.com/volarjs/volar.js/blob/bfa90aec50b975189f574b47affb619b9e1d679d/packages/language-server/tsconfig.json#L5-L8)，才能获取到依赖正确的类型

    当依赖关系变多变复杂的时候，你的每一个包都需要同时维护俩套依赖定义方式，这显然是不够优雅的。

- Q: 为什么要有那么多的 tsconfig？

- A: 对于一个现代化并完善的前端项目来说，我们必然有几个核心需求
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

- [Monorepo tools](https://monorepo.tools/)
- [Monorepo vs. polyrepo](https://github.com/joelparkerhenderson/monorepo-vs-polyrepo)
- [Monorepo ≠ is different fromMonolith](https://blog.nrwl.io/misconceptions-about-monorepos-monorepo-monolith-df1250d4b03c)
- [Node.js 中的条件导出](https://nodejs.org/api/packages.html#conditional-exports)
- [TypeScript 中的模块解析策略](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option)

## 未来

- 自动化体系的完善
  - 发包
  - 部署
- 优化任务流

  根据目标的依赖关系进行构建任务规划，从而避免整体构建的性能困境与手动规划任务困难的难点
- 不再依赖任何的 PM 工具
