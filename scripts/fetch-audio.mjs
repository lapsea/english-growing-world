// 一次性脚本：为单词下载真人发音音频并生成清单。
// 音源优先级：Wikimedia Commons 词典真人录音（英式 En-uk 优先，匹配词库英式音标）→ 有道真人发音（英式）。
// 运行：node scripts/fetch-audio.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/audio')
mkdirSync(outDir, { recursive: true })

// —— 收集需要发音的单词：词库全部单词 + 听力关键词 ——
const collect = (file, re) => {
  const src = readFileSync(join(root, file), 'utf8')
  return [...src.matchAll(re)].map((m) => m[1])
}
const wordBank = collect('src/data/words.ts', /\ben:\s*'([^']+)',/g)
const listening = collect('src/data/listening.ts', /\{ en: '([^']+)', zh:/g)
  .filter((t) => /^[a-zA-Z][a-zA-Z' -]*$/.test(t) && t.split(' ').length <= 3 && t.length <= 24)

const seen = new Map() // lower -> 原始大小写
for (const w of [...wordBank, ...listening]) if (!seen.has(w.toLowerCase())) seen.set(w.toLowerCase(), w)
const entries = [...seen.entries()] // [lowerKey, display]

const manifest = {}
const existingOf = (key) => {
  for (const ext of ['mp3', 'ogg', 'wav', 'flac']) {
    const p = join(outDir, `${key}.${ext}`)
    if (existsSync(p)) return `/audio/${key}.${ext}`
  }
  return null
}

const UA = { 'User-Agent': 'english-growing-world-demo/1.0 (local educational demo)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function download(url, file) {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) return false
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1500) return false
  writeFileSync(join(outDir, file), buf)
  return true
}

// —— 第一轮：Commons 词典真人录音（已知命名 En-uk/En-us + .ogg），先查询后按优先级下载 ——
async function commonsBatch(keys, variants) {
  const titleInfo = new Map() // title -> { key, vi }
  for (const key of keys) {
    const display = seen.get(key)
    for (let vi = 0; vi < variants.length; vi++) {
      for (const w of [...new Set([key, display])]) {
        const t = `File:${variants[vi]}-${w}.ogg`
        if (!titleInfo.has(t)) titleInfo.set(t, { key, vi })
      }
    }
  }
  const titles = [...titleInfo.keys()]
  const titleUrl = new Map()
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50)
    const url =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&formatversion=2&titles=' +
      encodeURIComponent(batch.join('|'))
    try {
      const res = await fetch(url, { headers: UA })
      const data = await res.json()
      for (const page of data.query?.pages ?? []) {
        if (page.imageinfo?.[0]?.url) titleUrl.set(page.title, page.imageinfo[0].url.split('?')[0])
      }
    } catch (e) {
      console.log(`batch err: ${e.message}`)
    }
    await sleep(300)
  }
  // 按优先级挑选每个词的最佳录音（英式优先）
  const best = new Map() // key -> { url, vi }
  for (const [title, url] of titleUrl) {
    const info = titleInfo.get(title)
    if (!info) continue
    const cur = best.get(info.key)
    if (!cur || info.vi < cur.vi) best.set(info.key, { url, vi: info.vi })
  }
  for (const [key, { url, vi }] of best) {
    if (manifest[key]) continue
    const ext = url.split('.').pop()
    if (await download(url, `${key}.${ext}`)) {
      manifest[key] = `/audio/${key}.${ext}`
      console.log(`commons ${key} <- ${variants[vi]}`)
    }
    await sleep(120)
  }
}

// —— 第二轮：有道真人发音兜底（英式 type=1）——
async function youdao(keys) {
  for (const key of keys) {
    const display = seen.get(key)
    try {
      const res = await fetch(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(display)}&type=1`, {
        headers: UA,
      })
      const buf = Buffer.from(await res.arrayBuffer())
      const isAudio = (res.headers.get('content-type') || '').includes('audio')
      if (res.ok && isAudio && buf.length > 2000) {
        writeFileSync(join(outDir, `${key}.mp3`), buf)
        manifest[key] = `/audio/${key}.mp3`
        console.log(`youdao ${key} (${buf.length}b)`)
      } else {
        console.log(`MISS ${key}`)
      }
    } catch (e) {
      console.log(`MISS ${key}: ${e.message}`)
    }
    await sleep(150)
  }
}

const need = []
for (const [key] of entries) {
  const ex = existingOf(key)
  if (ex) manifest[key] = ex
  else need.push(key)
}
console.log(`total ${entries.length}, cached ${entries.length - need.length}, todo ${need.length}`)

if (need.length) await commonsBatch(need, ['En-uk', 'En-us'])
let rest = need.filter((k) => !manifest[k])
console.log(`after commons: ${rest.length} missing`)
if (rest.length) await commonsBatch(rest, ['En-au', 'En-uk-north'])
rest = rest.filter((k) => !manifest[k])
if (rest.length) await youdao(rest)

const miss = entries.map(([k]) => k).filter((k) => !manifest[k])
const ts = `// 由 scripts/fetch-audio.mjs 生成：单词 → 打包内真人发音音频路径（public/audio/）
// 音源：Wikimedia Commons 词典真人录音（CC 授权）+ 有道真人发音
export const PRONUNCIATIONS: Record<string, string> = ${JSON.stringify(manifest, null, 2)}
`
writeFileSync(join(root, 'src/data/pronunciations.ts'), ts)

console.log(`\ndone: ${Object.keys(manifest).length}/${entries.length}, miss: ${miss.length ? miss.join(', ') : 'none'}`)
