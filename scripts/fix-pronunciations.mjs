// 一次性脚本： pronunciation 质量修复。
// 1) 对清单内全部单词拉取剑桥页面 canonical，凡与请求词不一致（重定向污染）的，
//    改用有道真人发音重新下载；
// 2) 统一文件名为连字符小写，清单值同步；
// 3) 删除孤儿文件（含空格旧文件、.ogg）。
// 运行：node scripts/fix-pronunciations.mjs
import { readFileSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/audio')
const manifestPath = join(root, 'src/data/pronunciations.ts')

const src = readFileSync(manifestPath, 'utf8')
const manifest = JSON.parse(src.match(/=\s*(\{[\s\S]*\})\s*$/)[1].replace(/"([^"]+)":/g, '"$1":'))

const UA = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 english-growing-world-demo',
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slugOf = (key) => key.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function downloadYoudao(key) {
  const display = key.replace(/-/g, ' ')
  const res = await fetch(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(display)}&type=1`, {
    headers: UA,
    signal: AbortSignal.timeout(12000),
  })
  const buf = Buffer.from(await res.arrayBuffer())
  if (res.ok && (res.headers.get('content-type') || '').includes('audio') && buf.length > 2000) {
    writeFileSync(join(outDir, `${slugOf(key)}.mp3`), buf)
    manifest[key] = `/audio/${slugOf(key)}.mp3`
    return true
  }
  return false
}

const fixed = []
const failed = []

for (const key of Object.keys(manifest)) {
  const slug = slugOf(key)
  const current = manifest[key]
  try {
    const res = await fetch(`https://dictionary.cambridge.org/dictionary/english/${slug}`, {
      headers: UA,
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) throw new Error(`page ${res.status}`)
    const html = await res.text()
    const canonical = html.match(/<link rel="canonical" href="[^"]*\/dictionary\/english\/([^"]*)"/)?.[1] ?? ''
    if (canonical.toLowerCase() !== slug.toLowerCase()) {
      const ok = await downloadYoudao(key)
      if (ok) fixed.push(`${key} (canonical=${canonical || 'none'})`)
      else failed.push(key)
      console.log(`contaminated ${key}: canonical "${canonical}" → ${ok ? 'youdao 已替换' : '替换失败'}`)
    } else if (current !== `/audio/${slug}.mp3`) {
      // 音频正确但路径未规范成连字符文件名
      const oldFile = current.replace('/audio/', '')
      const spaceFile = join(outDir, decodeURIComponent(oldFile))
      const target = join(outDir, `${slug}.mp3`)
      if (existsSync(spaceFile) && spaceFile !== target) {
        writeFileSync(target, readFileSync(spaceFile))
      }
      manifest[key] = `/audio/${slug}.mp3`
      console.log(`normalized ${key}`)
    }
  } catch (e) {
    failed.push(key)
    console.log(`check fail ${key}: ${e.message}`)
  }
  await sleep(300)
}

// 清理孤儿文件：只保留清单指向的文件
const keep = new Set(Object.values(manifest).map((p) => p.replace('/audio/', '')))
for (const f of readdirSync(outDir)) {
  if (!keep.has(f)) {
    unlinkSync(join(outDir, f))
    console.log(`removed orphan ${f}`)
  }
}

const ts = `// 由 scripts/fetch-audio.mjs / fetch-cambridge.mjs / fix-pronunciations.mjs 生成
// 单词 → 打包内真人发音音频路径（public/audio/）
// 音源：剑桥词典真人录音（英式优先，经 canonical 校验）+ 有道真人发音
export const PRONUNCIATIONS: Record<string, string> = ${JSON.stringify(manifest, null, 2)}
`
writeFileSync(manifestPath, ts)
console.log(`\ndone: fixed ${fixed.length}, failed ${failed.length}${failed.length ? ' → ' + failed.join(', ') : ''}`)
