# 更新日志

## 2026-06-19

### 词性关键词高亮（加粗 + 变色）

**新增文件：**
- `src/posHighlighter.js` — 词性关键词高亮核心模块

**功能：**
- 识别翻译文本中的词性关键词（如 `adj.`、`n.`、`v.` 等 23 种）
- 页面显示、Word 导出、Excel 导出三处统一加粗 + 变色
- 仅匹配带点号（`.`）的完整词性关键词，避免误判
- 每个词性前自动换行，同一词性全局颜色一致

**词性颜色表（23 种）：**

| 关键词 | 含义 | 颜色 |
|--------|------|------|
| adj. | 形容词 | #E74C3C 红 |
| adv. | 副词 | #E67E22 橙 |
| n. | 名词 | #27AE60 绿 |
| v. | 动词 | #3498DB 蓝 |
| vt. | 及物动词 | #2980B9 深蓝 |
| vi. | 不及物动词 | #1ABC9C 青 |
| prep. | 介词 | #9B59B6 紫 |
| conj. | 连词 | #F39C12 橙黄 |
| pron. | 代词 | #16A085 墨绿 |
| art. | 冠词 | #E91E63 粉 |
| num. | 数词 | #00BCD4 亮青 |
| interj. / int. | 感叹词 | #FF5722 深橙 |
| aux. | 助动词 | #607D8B 蓝灰 |
| vbl. | 非谓语动词 | #795548 棕 |
| u. / c. | 不可数/可数名词 | #9E9E9E 灰 |
| pl. | 复数 | #8BC34A 浅绿 |
| abbr. | 缩略词 | #FF9800 琥珀 |
| pref. / suff. | 前缀/后缀 | #673AB7 深紫 |
| symb. | 符号 | #795548 棕 |
| phr. | 短语 | #009688 蓝绿 |

**修改文件：**
- `src/Table.js` — TransTd 组件调用 `parseTranslation()`，词性关键词以内联样式 `<span style="font-weight:bold;color:...">` 渲染
- `src/App.js` — 导入 `parseTranslation`、`buildRichTextXml`
- `package.json` — 新增依赖 `jszip` ^3.10.1

---

### Excel 导出手动构建（替换 xlsx 库）

**原因：** xlsx 库不支持 SST（共享字符串表）富文本，无法在 Excel 中实现词性加粗变色。

**方案：** 弃用 xlsx 库的 `table_to_book` + `writeFileXLSX`，改为手动构建 xlsx ZIP 包：
- 使用 JSZip 打包
- 手动写入 `[Content_Types].xml`、`_rels/.rels`、`xl/workbook.xml`、`xl/_rels/workbook.xml.rels`、`xl/worksheets/sheet1.xml`、`xl/sharedStrings.xml`、`xl/styles.xml`
- 翻译列使用 SST 富文本（`<r><rPr><b/><color rgb="FFxxxxxx"/></rPr><t>text</t></r>` 格式）
- XML 特殊字符全面转义（`&` `<` `>` `"` `\r` `\n` `\t`）

---

### Excel 导出样式

**列宽（Excel 字符宽度单位）：**
- A 列（序号）：5
- B 列（单词）：12.3
- C 列（音标）：15.4
- D 列（翻译）：55

**单元格格式：**
- 自动换行 `wrapText="1"`
- 左上对齐 `vertical="top"`
- 全部 4 列统一应用

**隔行变色：**
- 奇数行底色 `#F5F5F5`（浅灰）
- 偶数行白底
- 新增 `fills[2]`（浅灰填充）和 `cellXfs[2]`（浅灰底色 + 换行 + 左上对齐）

---

### 导出按钮优化

- `src/style.css` — 移除 MUI Button hover 放大/浮起效果（`transform: none !important`、`box-shadow: none !important`）

---

### 四、导出方式区域

- 按钮容器添加固定高度 `100px`，`flex-wrap: wrap`，超出滚动

---

### 五、手动复制区域 — 展开/折叠

- 新增两个独立按钮，分别控制"可手动复制到墨墨/不背/扇贝单词"和"可手动复制到百词斩"的展开/折叠
- 默认折叠（`showCopyMomo: false`、`showCopyBaicizhan: false`）
- 点击按钮文字在"展开"/"折叠"间切换

---

### 页面表格优化

- 移除单元格 `&nbsp;` 前置空白，改用 CSS `padding-left: 5px`
- Word 导出不再携带 `&nbsp;` 空白符号
- 隔行变色：`tbody tr:nth-child(odd)` → 浅灰底色 `#F5F5F5`

---

### 翻译列内容处理

- 每行翻译中多个词性关键词前自动插入换行，确保每个词性另起一行
- 词性关键词前后空格自动移除
- 翻译文本首尾空格自动 trim

---

### 关键文件清单

| 文件 | 说明 |
|------|------|
| `src/posHighlighter.js` | 词性关键词定义、parseTranslation、buildRichTextXml |
| `src/Table.js` | 翻译列渲染（页面 + Word 导出） |
| `src/App.js` | Excel 导出手动构建、展开折叠按钮、样式配置 |
| `src/style.css` | 表格样式、按钮样式、隔行变色 |
| `package.json` | 新增 jszip 依赖 |
| `CHANGELOG.md` | 本文件 |
