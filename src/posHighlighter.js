/**
 * 词性关键词高亮模块
 * 用于识别翻译文本中的词性关键词（如 adj.、n.、v. 等），
 * 将其拆分为带有高亮标记的段落数组，支持 HTML 渲染和 Excel 富文本导出。
 *
 * 注意：只匹配带点号（.）的完整词性关键词，避免把单词中的普通字母误判为词性。
 */

// 词性关键词定义及其对应的固定颜色（同一词性全局颜色一致）
const POS_KEYWORDS = [
  { key: 'adj.',   color: '#E74C3C' },  // 形容词 - 红色
  { key: 'adv.',   color: '#E67E22' },  // 副词 - 橙色
  { key: 'n.',     color: '#27AE60' },  // 名词 - 绿色
  { key: 'v.',     color: '#3498DB' },  // 动词 - 蓝色
  { key: 'vt.',    color: '#2980B9' },  // 及物动词 - 深蓝
  { key: 'vi.',    color: '#1ABC9C' },  // 不及物动词 - 青色
  { key: 'prep.',  color: '#9B59B6' },  // 介词 - 紫色
  { key: 'conj.',  color: '#F39C12' },  // 连词 - 橙黄
  { key: 'pron.',  color: '#16A085' },  // 代词 - 墨绿
  { key: 'art.',   color: '#E91E63' },  // 冠词 - 粉色
  { key: 'num.',   color: '#00BCD4' },  // 数词 - 亮青
  { key: 'interj.',color: '#FF5722' },  // 感叹词 - 深橙
  { key: 'int.',   color: '#FF5722' },  // 感叹词（缩写）- 深橙（与 interj. 同色）
  { key: 'aux.',   color: '#607D8B' },  // 助动词 - 蓝灰
  { key: 'vbl.',   color: '#795548' },  // 非谓语动词 - 棕色
  { key: 'u.',     color: '#9E9E9E' },  // 不可数名词 - 灰色
  { key: 'c.',     color: '#9E9E9E' },  // 可数名词 - 灰色（与 u. 同色）
  { key: 'pl.',    color: '#8BC34A' },  // 复数 - 浅绿
  { key: 'abbr.',  color: '#FF9800' },  // 缩略词 - 琥珀色
  { key: 'pref.',  color: '#673AB7' },  // 前缀 - 深紫
  { key: 'suff.',  color: '#673AB7' },  // 后缀 - 深紫（与 pref. 同色）
  { key: 'symb.',  color: '#795548' },  // 符号 - 棕色
  { key: 'phr.',   color: '#009688' },  // 短语 - 蓝绿
];

// 建立小写关键词 → 颜色 的快速查找表
const POS_COLOR_MAP = {};
POS_KEYWORDS.forEach(item => {
  POS_COLOR_MAP[item.key.toLowerCase()] = item.color;
});

// 构建正则表达式：匹配所有词性关键词（点号必需，按长度降序确保长关键词优先匹配）
const sortedKeys = POS_KEYWORDS
  .map(item => item.key)
  .sort((a, b) => b.length - a.length); // 长关键词优先（interj. 优先于 int.）

// 转义每个关键词中的点号，确保正则精确匹配
const escapedKeys = sortedKeys.map(k => {
  const base = k.replace(/\./g, '\\.'); // adj. → adj\.
  return base;
});
const POS_PATTERN = escapedKeys.join('|');
const POS_REGEX = new RegExp(POS_PATTERN, 'gi');

/**
 * 解析翻译文本，将词性关键词与普通文本拆分为段落数组
 * - 只匹配带点号（.）的完整词性关键词（如 "adj."、"n."），避免误判
 * - 匹配到的词性关键词会被标记为 isPos: true，并附带对应颜色
 * - 关键词前后的空格会被自动移除
 * - 支持一个翻译行中匹配多个词性关键词
 *
 * @param {string} trans - 翻译文本字符串，如 "n. 苹果；adj. 红色的"
 * @returns {Array<{text: string, isPos: boolean, color?: string}>} 段落数组
 *
 * @example
 * parseTranslation("n. 苹果；adj. 红色的；v. 吃")
 * // => [
 * //   { text: "n.", isPos: true, color: "#27AE60" },
 * //   { text: "苹果；", isPos: false },
 * //   { text: "adj.", isPos: true, color: "#E74C3C" },
 * //   { text: "红色的；", isPos: false },
 * //   { text: "v.", isPos: true, color: "#3498DB" },
 * //   { text: "吃", isPos: false }
 * // ]
 */
export function parseTranslation(trans) {
  if (!trans || typeof trans !== 'string') return [{ text: trans || '', isPos: false }];

  const segments = [];
  let lastIndex = 0;
  let match;

  // 重置正则状态（全局正则有状态，需要重置 lastIndex）
  POS_REGEX.lastIndex = 0;

  while ((match = POS_REGEX.exec(trans)) !== null) {
    const rawKey = match[0];
    const matchStart = match.index;

    // 获取关键词之前的文本，并移除尾部空格
    let beforeText = trans.slice(lastIndex, matchStart);
    beforeText = beforeText.replace(/\s+$/, '');
    if (beforeText) {
      segments.push({ text: beforeText, isPos: false });
    }

    // 非行首的词性前插入换行段落，确保每个词性另起一行
    if (segments.length > 0) {
      segments.push({ text: '\n', isPos: false });
    }

    // 添加词性关键词段落
    const keyLower = rawKey.toLowerCase();
    segments.push({
      text: keyLower,
      isPos: true,
      color: POS_COLOR_MAP[keyLower]
    });

    // 计算关键词之后的起始位置，跳过紧随关键词的空白
    lastIndex = matchStart + rawKey.length;
    while (lastIndex < trans.length && /\s/.test(trans[lastIndex])) {
      lastIndex++;
    }
  }

  // 处理剩余的尾部文本，移除前后空格
  if (lastIndex < trans.length) {
    let remaining = trans.slice(lastIndex).trim();
    if (remaining) {
      segments.push({ text: remaining, isPos: false });
    }
  }

  return segments.length > 0 ? segments : [{ text: trans, isPos: false }];
}

/**
 * 将翻译文本数组中的每个字符串用 parseTranslation 解析后拼接
 * 返回一个合并的段落数组（翻译行之间用换行分隔）
 *
 * @param {string[]} transArr - 翻译文本数组
 * @returns {Array<{text: string, isPos: boolean, color?: string}>}
 */
export function parseTranslationArray(transArr) {
  if (!transArr || !Array.isArray(transArr)) return [];

  const allSegments = [];
  transArr.forEach((tran, idx) => {
    if (idx > 0) {
      allSegments.push({ text: '\n', isPos: false });
    }
    const parsed = parseTranslation(tran);
    allSegments.push(...parsed);
  });
  return allSegments;
}

/**
 * 生成用于 xlsx 共享字符串表（SST）的富文本 XML 字符串
 * 格式遵循 OOXML 规范：<r><rPr><b/><color rgb="FFXXXXXX"/></rPr><t>text</t></r>
 *
 * @param {Array<{text: string, isPos: boolean, color?: string}>} segments - parseTranslation 的输出
 * @returns {string} 富文本 XML
 */
export function buildRichTextXml(segments) {
  if (!segments || segments.length === 0) return '<r><t></t></r>';

  const runs = segments.map(seg => {
    // 转义 XML 特殊字符，\n 转为 &#10;（Excel 换行）
    const escapedText = seg.text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/\r/g, '&#13;')
      .replace(/\n/g, '&#10;')
      .replace(/\t/g, '&#9;');

    if (seg.isPos && seg.color) {
      const colorRgb = seg.color.replace('#', '');
      return '<r><rPr><b/><color rgb="FF' + colorRgb + '"/></rPr><t xml:space="preserve">' + escapedText + '</t></r>';
    }
    return '<r><t xml:space="preserve">' + escapedText + '</t></r>';
  });

  return runs.join('');
}

export { POS_KEYWORDS, POS_COLOR_MAP };
