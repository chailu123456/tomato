commit 规范

```
feat 增加新功能
fix 修复问题/BUG
style 代码风格相关无影响运行结果的
perf 优化/性能提升
refactor 重构
revert 撤销修改
test 测试相关
docs 文档/注释
chore 依赖更新/脚手架配置修改等
workflow 工作流改进
ci 持续集成
types 类型定义文件更改
wip 开发中

commit提交格式为：
git commit -m 'xxx: 你的修改信息'

注意，上方的冒号之后，有一个空格，需要符合commit格式规范，否则代码无法commit
```

目录结构

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

等待实现的功能

```
黑夜模式
表单或者模块的动画渐入，通过class实现
i18n
happypack的加速功能
修改系统主题功能
```
