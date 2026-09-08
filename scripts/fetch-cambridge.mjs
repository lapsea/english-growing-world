// 一次性脚本：用剑桥词典真人录音（英式优先）升级 public/audio 中已有音频。
// 已存在的 mp3 会被剑桥音源覆盖（质量更高、更标准）；页面缺失或无 UK/US 音频时保留原文件。
// 运行：node scripts/fetch-cambridge.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/audio')
const manifestPath = join(root, 'src/data/pronunciations.ts')

const src = readFileSync(manifestPath, 'utf8')
const m = src.match(/=\s*(\{[\s\S]*\})\s*$/)
const manifest = JSON.parse(m[1].replace(/"([^"]+)":/g, '"$1":'))

const UA = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 english-growing-world-demo',
}

const keys = Object.keys(manifest)
let upgraded = 0
let kept = 0

for (const key of keys) {
  const display = key.replace(/-/g, ' ')
  const url = `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(display.replace(/ /g, '-'))}`
  try {
    const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(12000) })
    if (res.ok) {
      const html = await res.text()
      const uk = html.match(/\/media\/english\/uk_pron\/[^"']+\.mp3/)
      const us = html.match(/\/media\/english\/us_pron\/[^"']+\.mp3/)
      const pick = uk ?? us
      if (pick) {
        const audioRes = await fetch(`https://dictionary.cambridge.org${pick[0]}`, { headers: UA, signal: AbortSignal.timeout(12000) })
        const buf = Buffer.from(await audioRes.arrayBuffer())
        if (audioRes.ok && buf.length > 1500) {
          const old = manifest[key]
          writeFileSync(join(outDir, `${key}.mp3`), buf)
          manifest[key] = `/audio/${key}.mp3`
          upgraded++
          if (old !== manifest[key]) console.log(`cambridge ${key} (${uk ? 'uk' : 'us'}, ${buf.length}b) 换掉了 ${old}`)
          await new Promise((r) => setTimeout(r, 350))
          continue
        }
      }
    }
    kept++
    console.log(`keep ${key}（剑桥无对应录音）`)
  } catch (e) {
    kept++
    console.log(`keep ${key}: ${e.message}`)
  }
  await new Promise((r) => setTimeout(r, 350))
}

// 清理：若清单指向 .mp3 但存在同名旧 ogg/wav，删除冗余
const ts = `// 由 scripts/fetch-audio.mjs / fetch-cambridge.mjs 生成：单词 → 打包内真人发音音频路径（public/audio/）
// 音源：剑桥词典真人录音（英式优先）+ Wikimedia Commons 词典真人录音 + 有道真人发音
export const PRONUNCIATIONS: Record<string, string> = ${JSON.stringify(manifest, null, 2)}
`
writeFileSync(manifestPath, ts)
console.log(`\ndone: cambridge upgraded ${upgraded}, kept original ${kept}, total ${keys.length}`)
