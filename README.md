# 嵌入式秋招学习站

按照先前的《思路.md》方案建立的中文 MCU + FreeRTOS 学习网站。

## 当前内容

- 12 个模块、100 节课程、300 道原创随堂选择题。
- 每课都有三步原理解释、易混点及一个推导例题，共 100 道例题，解析默认折叠。
- 17 道手写与场景练习，相关算法题附力扣或牛客原题链接；本站题干、解法与说明为独立编写。
- 42 节课程有 SVG 图示；其中 18 节提供逐步执行、当前代码、变量监视、前后步进与重置。
- 详细推演覆盖指针、二维数组、结构体填充、链表反转、树先序、二分、冒泡、环形队列、SPI 四模式、CAN 仲裁、优先级继承、队列所有权、DMA、时钟树、STOP1 与周期延时。
- 答案默认隐藏。选择并提交或点“不会？查看解析”后，才显示答案与解析。
- 专题练习、错题复习、20 分钟模拟笔试、搜索、学习进度、代码草稿及导入/导出。

目前完成了方案中的基础主线和主要高频主题。方案预计的 180～220 节课程、800～1200 道练习属于后续扩充目标，网页按实际内容显示数量。

## 本地运行

在本目录运行：

```powershell
python -m http.server 8000 --directory dist
```

然后在浏览器打开 `http://localhost:8000`。网页是静态文件，无需安装 npm 依赖。不要双击 `index.html` 直接打开：浏览器通常会限制 `file://` 页面加载 JS 模块。

## 内容位置

- `dist/content.js`：模块、课程、随堂练习及参考来源。
- `dist/challenges.js`：编程和场景练习。
- `dist/extra-lessons.js`、`dist/extra-challenges.js`：新增专题及练习。
- `dist/tutorials.js`：原理、推导例题与易混点。
- `dist/detailed-answers.js`：高频选择题的详细推导。
- `dist/walkthroughs.js`：逐步执行的状态数据；链表、树、排序、二分按实际算法生成状态。
- `dist/lesson-reading.js`：讲解、折叠例题与图解渲染。
- `dist/app.js`：页面、交互图解与学习记录。
- `dist/styles.css`：页面样式和移动端布局。

学习记录仅在当前浏览器的 `localStorage` 中，清理浏览器数据会丢失记录；可在“资料来源”页导出 JSON 备份。代码草稿不提供在线编译判题，算法题可去所附原题页面提交或在本地编译。

## 检查

```powershell
node --check dist/content.js
node --check dist/challenges.js
node --check dist/app.js
node scripts/smoke.mjs
```

`smoke.mjs` 会遍历所有课程与练习页，检查答案初始隐藏、解析展示和错题重做流程。

它还验证全课程原理覆盖、题目 ID、链表反转连接、树遍历顺序、排序结果、二分保留目标以及四种 SPI 采样规则。

Windows 上安装了默认位置的 Chrome 时，可运行 `node scripts/browser-check.mjs`。脚本使用独立浏览器目录和本地服务器，检查真实页面的例题折叠、步进/重置、四种 SPI 模式以及 390 px 手机布局，截图保存在项目上级的 `tmp/reading-qa`。可在脚本中调整 Chrome 路径；这不是网站运行依赖。
