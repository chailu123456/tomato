## 项目介绍

- **项目背景**：TOMATO 系统是服务于集团的内部管理平台，用户可以在平台完成一整套完成的开发管理流程。我们充分集成第三方插件及自研各类高效功能，提供了高效、便捷、稳定的平台，为集团开发世界级前沿项目，提供了坚实的后盾。
- **项目人员介绍**
  产品&项目负责人：石健康
  后端技术负责人：周涛章
  前端技术负责人：宋绍华
  测试负责人：周伟
  核心开发者：王粘军、柴璐
- **项目技术栈**：后端：golang, 前端：Vue3.x + vue-router4.x + vuex4.x + element-plus1.x + typescript4.x

## 项目运行机制

- git 地址：http://inside.rvet.cn:3088/IntelligenceCenter/tomato-pc.git
- 开发环境运行：npm install、npm run serve
- 测试环境：npm run dev-build 构建后把 dist 文件提交远端，去到 Jenkins 平台，找到主分支直接构建。
- 生产环境：npm run build 构建后把 dist 文件提交远端，Jenkins 平台构建 master 分支。

## 项目目录

```

├─api  接口请求
├─assets 静态资源
├─components 公共组件
│  ├─expand  拓展三方组件
│  │  └─calendar
│  ├─pageTable
│  ├─pagination
│  ├─progressBar
│  ├─transition
│  └─wangeditor
├─directives 自定义指令
├─hooks  全局hooks
├─layout 布局
│  ├─header
│  ├─main
│  └─side
├─locales i18n相关
│  └─lang
├─plugins 插件
│  └─i18n
├─router 路由
├─store  vuex
├─styles 全局样式
│  └─iconfont
├─theme  自定义的主题
│  └─fonts
├─types 全局的types
├─utils 工具文件夹
└─views 界面相关
    ├─home
    ├─iteration
    │  └─test
    ├─login
    ├─overview
    │  ├─allOverview
    │  └─calendar
    ├─product
    │  ├─demandPool
    │  ├─planManagement
    │  │  └─hooks
    │  └─productList
    └─team
        ├─project
        └─user

```

## 项目规范 【重点】

### 1. 编码规范

1. js 规范, 提供 eslint 插件 (@vue/airbnb) 检测 airbnb JavaScript 规范
2. css 规范，提供 vs code stylelint 插件，stylelint 配置 stylelint-config-standard 插件 styleguide
3. Vue 编码规范 可以参考 Vue 风格指南，或者（vue/attributes-order | eslint-plugin-vue (vuejs.org)）

### 2. 命名规范

1. Vue 规范可以 参考 Vue 风格指南
2. js 可以参考 airbnb 的规范 airbnb JavaScript 规范
3. css 可以参考 CSS BEM 书写规范

### 3. 文件命名

1. 目录(文件夹)

   - 目录(文件夹)：全部采用小写方式， 以中划线分隔，有复数结构时，要采用复数命名法， 缩写不用复数 kebab-case
   - 示例： scripts / styles / components / images / utils / layouts / demo-styles / demo-scripts / img / doc

【特殊】Vue components(公共组件，业务组件(业务模块里面抽离出来的组件))都采用大驼峰 PascalCase
Tips: 目录命名需要用名词，最好不好出现动词之类。 最多不超超过 3 级，反例： get-my-components-items，正例：my-items 2. 文件

- 全部采用小写方式， 以中划线分隔 kebab-case
- 示例： render-dom.js / signup.css / index.html / company-logo.png

### 4. commit 规范

使用 commitlint 可以规范化提交信息，同样的，可以设置工具来检查提交信息是否符合格式要求, 具体 commit 提交的格式，可以参考如下。

- feat 增加新功能
- fix 修复问题/BUG
- style 代码风格相关无影响运行结果的
- perf 优化/性能提升
- refactor 重构
- revert 撤销修改
- test 测试相关
- docs 文档/注释
- chore 依赖更新/脚手架配置修改等
- workflow 工作流改进
- ci 持续集成
- types 类型定义文件更改
- wip 开发中
  commit 提交格式为：
  git commit -m 'xxx: 你的修改信息'
  注意，上方的冒号之后，有一个空格，需要符合 commit 格式规范，否则代码无法 commit

## 项目接口文档

swagger: http://10.1.1.248:8124/swagger/index.html

## 项目的注意事项

本地扫码登录需要修改 hosts 文件

```
window:C:\Windows\System32\drivers\etc\hosts
mac:因为贫穷不知道mac的hosts在哪里，自己找找

增加
你的ip tomato.petrvet.com // 示例
10.11.16.19 tomato.petrvet.com  // 示例
```

扫码登录之后，会跳转到空白页面，而且是 https，此时需要手动增加上端口号，修改回 http

```
https://tomato.petrvet.com/?code=xxxxxxxxxxx
// 修改回端口号和http即可
http://tomato.petrvet.com:8080/?code=xxxxxxxxxxx
```

test 1231231asda
