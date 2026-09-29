# 嵌入式秋招学习站

按照 [思路.md](../思路.md) 建立的中文 MCU + FreeRTOS 学习网站。

## 当前内容

- 12 个模块、82 节课程、246 道原创随堂选择题。
- 13 道手写与场景练习，其中算法题附力扣或牛客原题链接。
- 40 节课程带可单步推演的 SVG 图解，包括指针、结构体、排序、树、SPI、I²C、CAN、DMA 和低功耗等。
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
