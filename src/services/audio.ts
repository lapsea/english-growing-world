// 发音服务（页面只经由此层发声）：
// - 单词：播放打包在 public/audio/ 的真人录音（见 src/data/pronunciations.ts 清单），
//   清单未命中或播放失败时回退到语音合成；
// - 句子/短文：使用浏览器 SpeechSynthesis，自动挑选最自然的英文人声。
export interface SpeakOptions {
  rate?: number
  onEnd?: () => void
  onStart?: () => void
}

import { PRONUNCIATIONS } from '../data/pronunciations'

class SpeechService {
  private el: HTMLAudioElement | null = null
  private voice: SpeechSynthesisVoice | null = null
  private voiceReady = false
  private token = 0

  get supported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  speak(text: string, opts: SpeakOptions = {}) {
    const t = (text ?? '').trim()
    if (!t) {
      opts.onEnd?.()
      return
    }
    this.stop()
    const token = ++this.token
    const file = PRONUNCIATIONS[t.toLowerCase()]
    if (file) this.playFile(t, file, opts, token)
    else this.speakTTS(t, opts, token)
  }

  stop() {
    this.token++
    if (this.el) {
      this.el.onplaying = null
      this.el.onended = null
      this.el.onerror = null
      this.el.pause()
      this.el.currentTime = 0
    }
    if (this.supported) window.speechSynthesis.cancel()
  }

  /** 播放真人录音；rate < 1 时轻微放慢（保持音高）。失败自动回退到语音合成。 */
  private playFile(text: string, url: string, opts: SpeakOptions, token: number) {
    if (!this.el) {
      this.el = new Audio()
      this.el.preload = 'auto'
    }
    const el = this.el
    const rate = opts.rate ?? 1
    el.src = url
    el.playbackRate = rate < 1 ? Math.max(0.7, rate) : 1
    try {
      el.preservesPitch = true
      ;(el as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true
    } catch {
      /* 老浏览器忽略 */
    }
    el.onplaying = () => {
      if (token === this.token) opts.onStart?.()
    }
    el.onended = () => {
      if (token === this.token) opts.onEnd?.()
    }
    el.onerror = () => {
      if (token !== this.token) return
      el.onplaying = el.onended = el.onerror = null
      this.speakTTS(text, opts, token)
    }
    el.play().catch(() => {
      if (token === this.token) {
        el.onplaying = el.onended = el.onerror = null
        this.speakTTS(text, opts, token)
      }
    })
  }

  private ensureVoice() {
    if (!this.supported || this.voiceReady) return
    const pick = () => {
      const voices = window.speechSynthesis.getVoices()
      const en = voices.filter((v) => /^en[-_]?/i.test(v.lang))
      if (en.length === 0) return false
      const score = (v: SpeechSynthesisVoice) => {
        let s = 0
        if (/en[-_]US/i.test(v.lang)) s += 6
        else if (/en[-_]GB/i.test(v.lang)) s += 5
        else s += 2
        if (/natural|premium|enhanced/i.test(v.name)) s += 30
        if (/google/i.test(v.name)) s += 18
        if (/aria|jenny|guy|sonia|libby|samantha|karen|moira|daniel/i.test(v.name)) s += 12
        if (/compact|eloquence|espeak|festival|dingbat/i.test(v.name)) s -= 25
        if (v.localService) s += 3
        return s
      }
      this.voice = [...en].sort((a, b) => score(b) - score(a))[0] ?? null
      this.voiceReady = this.voice !== null
      return this.voiceReady
    }
    if (!pick()) {
      // voices 异步加载，监听一次
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        pick()
      }
    }
  }

  private speakTTS(text: string, opts: SpeakOptions, token: number) {
    if (!this.supported) {
      opts.onEnd?.()
      return
    }
    this.ensureVoice()
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = this.voice?.lang ?? 'en-US'
    if (this.voice) u.voice = this.voice
    u.rate = Math.min(1.4, Math.max(0.5, opts.rate ?? 1))
    u.pitch = 1
    u.onstart = () => {
      if (token === this.token) opts.onStart?.()
    }
    u.onend = () => {
      if (token === this.token) opts.onEnd?.()
    }
    u.onerror = () => {
      if (token === this.token) opts.onEnd?.()
    }
    window.speechSynthesis.speak(u)
  }
}

export const speech = new SpeechService()
