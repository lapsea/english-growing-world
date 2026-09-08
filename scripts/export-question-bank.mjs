// 将 src/data 下的题库内容导出为分类 Markdown，输出到 题库导出/
// 运行：node scripts/export-question-bank.mjs
import { build } from 'esbuild'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const OUT = path.join(ROOT, '题库导出')
const TMP = path.join(ROOT, 'scripts/.tmp-export')

const DATA_FILES = ['units', 'words', 'questions', 'exams', 'listening', 'reading', 'writing', 'gameContent']

await rm(TMP, { recursive: true, force: true })
await mkdir(TMP, { recursive: true })

const data = {}
for (const name of DATA_FILES) {
  const outfile = path.join(TMP, `${name}.mjs`)
  await build({
    entryPoints: [path.join(ROOT, 'src/data', `${name}.ts`)],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })
  const mod = await import(pathToFileURL(outfile).href)
  Object.assign(data, mod)
}
await rm(TMP, { recursive: true, force: true })

const { units, words, practiceQuestions, examChallenges, listeningPrograms, readingArticles, writingTasks, scrambleSentences, grammarDetectItems } = data

// ---------- 工具 ----------
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|')
const LETTERS = 'ABCDEFGH'

const unitById = Object.fromEntries(units.map((u) => [u.id, u]))
const unitNo = (u) => (u.kind === 'starter' ? `Starter Unit ${u.order}` : `Unit ${u.order - 3}`)
const unitName = (u) => `${unitNo(u)} ${u.title}（${u.titleZh}）`
const stars = (d) => '★'.repeat(d || 1)
const MODULE_ZH = { vocabulary: '词汇', grammar: '语法', listening: '听力', reading: '阅读', writing: '写作' }
const TYPE_ZH = { choice: '单选', fill: '填空' }

const unitWordGroups = units.map((u) => ({ unit: u, list: words.filter((w) => w.unitId === u.id) }))

function answerDisplay(q) {
  if (q.options) {
    const i = q.options.indexOf(q.answer)
    if (i >= 0) return `${LETTERS[i]}. ${q.answer}`
  }
  return q.answer
}

// 渲染一道选择/填空题（供练习题与试卷共用）
function renderQuestion(q, index) {
  const out = []
  const moduleZh = MODULE_ZH[q.module] ?? q.module
  const typeZh = TYPE_ZH[q.type] ?? q.type
  const unit = unitById[q.unitId]
  out.push(`#### 第 ${index} 题（${q.id}）｜ ${moduleZh} ｜ ${typeZh}${unit ? ` ｜ ${unitNo(unit)}` : ''}`)
  out.push('')
  const stemLines = String(q.stem).split('\n')
  if (stemLines.length > 1) {
    // 含短文的阅读题：短文整体作为引用块
    out.push(...stemLines.map((l) => `> ${l}`))
  } else {
    out.push(`**题目：** ${stemLines[0]}`)
  }
  out.push('')
  if (q.audioLine) {
    out.push('**录音原文：**')
    out.push('')
    String(q.audioLine).split('\n').forEach((l) => out.push(`> ${l}`))
    out.push('')
  }
  if (q.options) {
    out.push('**选项：**')
    out.push('')
    q.options.forEach((o, i) => out.push(`- ${LETTERS[i]}. ${o}`))
    out.push('')
  }
  out.push(`**答案：** ${answerDisplay(q)}`)
  out.push('')
  out.push(`**解析：** ${q.explain}`)
  out.push('')
  return out.join('\n')
}

async function save(filename, content) {
  await writeFile(path.join(OUT, filename), content.trimEnd() + '\n', 'utf8')
}

await mkdir(OUT, { recursive: true })

// ---------- 01 单元概览 ----------
{
  const parts = [
    '# 单元概览（人教版 2024 · 英语七年级上册）',
    '',
    `共 ${units.length} 个单元：3 个预备单元（Starter Unit 1–3）+ 7 个正式单元（Unit 1–7）。`,
    '',
  ]
  for (const u of units) {
    parts.push(`## ${unitName(u)}`)
    parts.push('')
    parts.push(`- **教材页码：** P${u.page}`)
    parts.push(`- **单元大问题（Big Question）：** ${u.bigQuestion}`)
    if (u.bigIdea) parts.push(`- **核心问题（Big Idea）：** ${u.bigIdea}`)
    parts.push(`- **语音专项：** ${u.pronunciation}`)
    parts.push(`- **主题语境：** ${u.themeContext}`)
    parts.push('')
    parts.push('**学习目标：**')
    parts.push('')
    u.goals.forEach((g) => parts.push(`- ${g}`))
    parts.push('')
    parts.push('**单元常用短语：**')
    parts.push('')
    parts.push('| 英文短语 | 中文意思 |')
    parts.push('| --- | --- |')
    u.phrases.forEach((p) => parts.push(`| ${esc(p.en)} | ${esc(p.zh)} |`))
    parts.push('')
  }
  await save('01-单元概览.md', parts.join('\n'))
}

// ---------- 02 单词库 ----------
{
  const parts = [
    '# 单词库（人教版 2024 · 英语七年级上册）',
    '',
    `共 ${words.length} 个单词，按单元分类。字段说明：音标为英式 IPA，例句均为原创句。`,
    '',
  ]
  for (const { unit, list } of unitWordGroups) {
    parts.push(`## ${unitName(unit)}（${list.length} 词）`)
    parts.push('')
    parts.push('| # | 单词 | 音标 | 词性 | 中文释义 | 例句 | 例句译文 |')
    parts.push('| --- | --- | --- | --- | --- | --- | --- |')
    list.forEach((w, i) => {
      parts.push(`| ${i + 1} | **${esc(w.en)}** | ${esc(w.phonetic)} | ${esc(w.pos)} | ${esc(w.zh)} | ${esc(w.exampleEn)} | ${esc(w.exampleZh)} |`)
    })
    parts.push('')
  }
  await save('02-单词库.md', parts.join('\n'))
}

// ---------- 03 语法知识点 ----------
{
  const parts = [
    '# 语法知识点（人教版 2024 · 英语七年级上册）',
    '',
    '按单元整理各单元的语法讲解与例句。',
    '',
  ]
  for (const u of units) {
    parts.push(`## ${unitName(u)} ｜ ${u.grammar.title}`)
    parts.push('')
    u.grammar.points.forEach((p, i) => {
      parts.push(`### ${i + 1}. ${p.name}`)
      parts.push('')
      parts.push(p.explain)
      parts.push('')
      parts.push('| 例句 | 译文 |')
      parts.push('| --- | --- |')
      p.examples.forEach((e) => parts.push(`| ${esc(e.en)} | ${esc(e.zh)} |`))
      parts.push('')
    })
  }
  await save('03-语法知识点.md', parts.join('\n'))
}

// ---------- 04 分模块练习题 ----------
{
  const parts = [
    '# 分模块练习题',
    '',
    `共 ${practiceQuestions.length} 题，覆盖词汇、语法、听力、阅读四个模块，题型为单选与填空。`,
    '',
  ]
  practiceQuestions.forEach((q, i) => parts.push(renderQuestion(q, i + 1)))
  await save('04-分模块练习题.md', parts.join('\n'))
}

// ---------- 05 考试卷 ----------
{
  const parts = [
    '# 考试卷',
    '',
    `共 ${examChallenges.length} 套冲刺卷。`,
    '',
  ]
  for (const exam of examChallenges) {
    const unitNames = exam.unitIds.map((id) => unitNo(unitById[id])).join('、')
    parts.push(`## ${exam.title}`)
    parts.push('')
    parts.push(`- **副标题：** ${exam.subtitle}`)
    parts.push(`- **覆盖单元：** ${unitNames}`)
    parts.push(`- **建议时长：** ${exam.durationMin} 分钟 ｜ **总分：** ${exam.totalScore} 分 ｜ **题数：** ${exam.questions.length}`)
    parts.push('')
    exam.questions.forEach((q, i) => parts.push(renderQuestion(q, i + 1)))
  }
  await save('05-考试卷.md', parts.join('\n'))
}

// ---------- 06 听力材料 ----------
{
  const totalQuiz = listeningPrograms.reduce((n, p) => n + p.quiz.length, 0)
  const parts = [
    '# 听力材料',
    '',
    `共 ${listeningPrograms.length} 组听力节目（${totalQuiz} 道配套测验题），录音文本与测验题均为原创。`,
    '',
  ]
  for (const p of listeningPrograms) {
    const unit = unitById[p.unitId]
    parts.push(`## ${p.title}（${p.titleZh}）`)
    parts.push('')
    parts.push(`- **所属单元：** ${unit ? unitName(unit) : p.unitId}`)
    parts.push(`- **类型：** ${p.type === 'dialogue' ? '情景对话' : '句子听力'} ｜ **主题：** ${p.theme} ｜ **难度：** ${stars(p.difficulty)} ｜ **时长：** 约 ${p.durationMin} 分钟`)
    parts.push('')
    parts.push('**听力关键词：**')
    parts.push('')
    parts.push('| 英文 | 中文 |')
    parts.push('| --- | --- |')
    p.keywords.forEach((k) => parts.push(`| ${esc(k.en)} | ${esc(k.zh)} |`))
    parts.push('')
    parts.push('**录音原文：**')
    parts.push('')
    if (p.type === 'dialogue') {
      parts.push('| # | 说话人 | 英文 | 中文 |')
      parts.push('| --- | --- | --- | --- |')
      p.lines.forEach((l, i) => parts.push(`| ${i + 1} | ${esc(l.speaker)} | ${esc(l.en)} | ${esc(l.zh)} |`))
    } else {
      parts.push('| # | 英文 | 中文 |')
      parts.push('| --- | --- | --- |')
      p.lines.forEach((l, i) => parts.push(`| ${i + 1} | ${esc(l.en)} | ${esc(l.zh)} |`))
    }
    parts.push('')
    parts.push('**配套测验：**')
    parts.push('')
    p.quiz.forEach((qz, i) => {
      parts.push(`### 测验 ${i + 1}（对应录音第 ${qz.lineIndex + 1} 句）｜ ${TYPE_ZH[qz.type] ?? qz.type}`)
      parts.push('')
      parts.push(`**题目：** ${qz.question}`)
      parts.push('')
      if (qz.options) {
        qz.options.forEach((o, j) => parts.push(`- ${LETTERS[j]}. ${o}`))
        parts.push('')
      }
      parts.push(`**答案：** ${answerDisplay(qz)}`)
      parts.push('')
      parts.push(`**解析：** ${qz.explain}`)
      parts.push('')
    })
  }
  await save('06-听力材料.md', parts.join('\n'))
}

// ---------- 07 阅读文章 ----------
{
  const totalEx = readingArticles.reduce((n, a) => n + a.exercises.length, 0)
  const parts = [
    '# 阅读文章',
    '',
    `共 ${readingArticles.length} 篇原创短文（${totalEx} 道配套习题），短文与习题均为原创。`,
    '',
  ]
  for (const a of readingArticles) {
    const unit = unitById[a.unitId]
    parts.push(`## ${a.title}（${a.titleZh}）`)
    parts.push('')
    parts.push(`- **所属单元：** ${unit ? unitName(unit) : a.unitId}`)
    parts.push(`- **体裁：** ${a.genre} ｜ **话题：** ${a.topic} ｜ **难度：** ${stars(a.difficulty)} ｜ **词数：** 约 ${a.wordCount} 词`)
    parts.push('')
    parts.push(`**导读：** ${a.guide}`)
    parts.push('')
    parts.push('**正文：**')
    parts.push('')
    a.paragraphs.forEach((para) => {
      parts.push(`> ${para.en}`)
      parts.push('>')
      parts.push(`> ${para.zh}`)
      parts.push('')
    })
    parts.push('**生词表：**')
    parts.push('')
    parts.push('| 单词/短语 | 中文 |')
    parts.push('| --- | --- |')
    a.glossary.forEach((g) => parts.push(`| ${esc(g.word)} | ${esc(g.zh)} |`))
    parts.push('')
    parts.push('**配套习题：**')
    parts.push('')
    a.exercises.forEach((ex, i) => {
      parts.push(`### 习题 ${i + 1}`)
      parts.push('')
      parts.push(`**题目：** ${ex.q}`)
      parts.push('')
      ex.options.forEach((o, j) => parts.push(`- ${LETTERS[j]}. ${o}`))
      parts.push('')
      parts.push(`**答案：** ${LETTERS[ex.answer]}. ${ex.options[ex.answer]}`)
      parts.push('')
      parts.push(`**解析：** ${ex.explain}`)
      parts.push('')
    })
  }
  await save('07-阅读文章.md', parts.join('\n'))
}

// ---------- 08 写作任务 ----------
{
  const parts = [
    '# 写作任务',
    '',
    `共 ${writingTasks.length} 个写作任务，含写作要求、实用词汇、句型、结构与范文。`,
    '',
  ]
  for (const t of writingTasks) {
    const unit = unitById[t.unitId]
    parts.push(`## ${t.title}`)
    parts.push('')
    parts.push(`- **所属单元：** ${unit ? unitName(unit) : t.unitId}（任务 ID：${t.id}）`)
    parts.push('')
    parts.push(`**题目要求：** ${t.prompt}`)
    parts.push('')
    parts.push('**写作要求：**')
    parts.push('')
    t.requirements.forEach((r) => parts.push(`- ${r}`))
    parts.push('')
    parts.push('**实用词汇：**')
    parts.push('')
    parts.push('| 英文 | 中文 |')
    parts.push('| --- | --- |')
    t.usefulWords.forEach((w) => parts.push(`| ${esc(w.en)} | ${esc(w.zh)} |`))
    parts.push('')
    parts.push('**常用句型：**')
    parts.push('')
    parts.push('| 句型 | 中文 |')
    parts.push('| --- | --- |')
    t.patterns.forEach((p) => parts.push(`| ${esc(p.pattern)} | ${esc(p.zh)} |`))
    parts.push('')
    parts.push('**写作结构（四步法）：**')
    parts.push('')
    parts.push('| 步骤 | 写法指导 |')
    parts.push('| --- | --- |')
    t.structure.forEach((s) => parts.push(`| ${esc(s.step)} | ${esc(s.detail)} |`))
    parts.push('')
    parts.push('**范文：**')
    parts.push('')
    t.sample.text.forEach((line) => parts.push(`> ${line}`))
    parts.push('')
    parts.push(`**教师点评（得分 ${t.sample.score} 分）：** ${t.sample.comment}`)
    parts.push('')
  }
  await save('08-写作任务.md', parts.join('\n'))
}

// ---------- 09 小游戏题库 ----------
{
  const parts = [
    '# 小游戏题库',
    '',
    '供学生端小游戏使用的静态素材：连词成句（Sentence Game）与语法侦探（Grammar Game）。',
    '',
    '## 一、连词成句素材',
    '',
    `共 ${scrambleSentences.length} 个句子，游戏时打乱单词顺序由学生重新排列。`,
    '',
    scrambleSentences.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    '',
    '## 二、语法侦探题库',
    '',
    `共 ${grammarDetectItems.length} 题：找出句中的错误（或确认无误）并改正。`,
    '',
  ]
  grammarDetectItems.forEach((g, i) => {
    parts.push(`### 侦探题 ${i + 1}`)
    parts.push('')
    parts.push(`> ${g.sentence}`)
    parts.push('')
    const tokens = g.sentence.split(/\s+/)
    const wrongWord = g.wrongIndex >= 0 ? tokens[g.wrongIndex] : null
    if (g.wrongIndex < 0) {
      parts.push('- **本句没有错误**，答案选"没有错误"。')
    } else {
      parts.push(`- **需修改的词：** ${wrongWord ?? '（见解析）'}`)
      parts.push(`- **改为：** ${g.fix}`)
    }
    parts.push(`- **修改选项：** ${g.options.join(' / ')}`)
    parts.push(`- **修改后的正确句子：** ${g.corrected}`)
    parts.push(`- **解析：** ${g.explain}`)
    parts.push('')
  })
  await save('09-小游戏题库.md', parts.join('\n'))
}

// ---------- README ----------
{
  const totalExamQ = examChallenges.reduce((n, e) => n + e.questions.length, 0)
  const totalListenQuiz = listeningPrograms.reduce((n, p) => n + p.quiz.length, 0)
  const totalReadEx = readingArticles.reduce((n, a) => n + a.exercises.length, 0)
  const phraseCount = units.reduce((n, u) => n + u.phrases.length, 0)
  const grammarCount = units.reduce((n, u) => n + u.grammar.points.length, 0)

  const parts = [
    '# 题库内容导出（人教版 2024 · 英语七年级上册）',
    '',
    `- **导出日期：** 2026-09-05`,
    `- **数据来源：** 本项目 \`src/data/\` 目录（words / units / questions / exams / listening / reading / writing / gameContent）`,
    `- **教材范围：** 3 个预备单元（Starter Unit 1–3）+ 7 个正式单元（Unit 1–7），共 ${units.length} 个单元`,
    '',
    '## 内容目录',
    '',
    '| 文件 | 内容 | 数量 |',
    '| --- | --- | --- |',
    `| [01-单元概览.md](01-单元概览.md) | 单元信息、学习目标、语音专项、常用短语 | ${units.length} 个单元 / ${phraseCount} 个短语 |`,
    `| [02-单词库.md](02-单词库.md) | 单词、音标、词性、释义、原创例句 | ${words.length} 个单词 |`,
    `| [03-语法知识点.md](03-语法知识点.md) | 各单元语法讲解与例句 | ${grammarCount} 个语法点 |`,
    `| [04-分模块练习题.md](04-分模块练习题.md) | 词汇 / 语法 / 听力 / 阅读日常练习 | ${practiceQuestions.length} 题 |`,
    `| [05-考试卷.md](05-考试卷.md) | 期中 / 期末冲刺卷 | ${examChallenges.length} 套 / ${totalExamQ} 题 |`,
    `| [06-听力材料.md](06-听力材料.md) | 听力原文、关键词、配套测验 | ${listeningPrograms.length} 组 / ${totalListenQuiz} 题 |`,
    `| [07-阅读文章.md](07-阅读文章.md) | 阅读短文、生词表、配套习题 | ${readingArticles.length} 篇 / ${totalReadEx} 题 |`,
    `| [08-写作任务.md](08-写作任务.md) | 写作要求、句型、结构、范文 | ${writingTasks.length} 个任务 |`,
    `| [09-小游戏题库.md](09-小游戏题库.md) | 连词成句素材、语法侦探找错题 | ${scrambleSentences.length} 句 / ${grammarDetectItems.length} 题 |`,
    '',
    '## 说明',
    '',
    '- 除特别标注外，单词例句、听力文本、阅读短文、范文等均为原创内容。',
    '- `src/data/pronunciations.ts` 仅为单词真人发音的音频路径映射（剑桥词典 / 有道音源），不含题库内容，未导出。',
    '- `src/data/community.ts` 为用户、班级、学习记录等种子数据，不属于题库，未导出。',
    '- 重新生成：在项目根目录运行 `node scripts/export-question-bank.mjs`。',
    '',
  ]
  await save('README.md', parts.join('\n'))
}

console.log('导出完成 →', OUT)
