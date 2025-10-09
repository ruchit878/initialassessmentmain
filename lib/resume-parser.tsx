// Enhanced resume parser with robust PDF/DOCX extraction and optional OCR fallback
// Works in Next.js by dynamically importing heavy/browser-only libraries

import type { ResumeData } from '@/lib/store'

// ----------------------- pdf.js (dynamic) -----------------------
let _pdfjs: any | null = null
async function getPdfjs() {
  if (_pdfjs) return _pdfjs
  if (typeof window === 'undefined') throw new Error('PDF parsing is only available in the browser')
  const mod = await import('pdfjs-dist/legacy/build/pdf.mjs')
  try {
    const version = (mod as any).version || '5.4.149'
    const workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/legacy/build/pdf.worker.min.js`
    if ((mod as any).GlobalWorkerOptions) {
      ;(mod as any).GlobalWorkerOptions.workerSrc = workerSrc
    }
  } catch {
    // ignore worker config errors; pdfjs will still work with useWorker: false
  }
  _pdfjs = mod
  return _pdfjs
}

// ----------------------- Keywords/heuristics -----------------------
const SKILL_KEYWORDS = {
  programming: [
    'javascript','typescript','python','java','c#','c++','r','php','ruby','go','rust',
    'react','next.js','angular','vue','node.js','express','django','flask','spring','spring boot',
    'html','css','graphql','rest','apollo'
  ],
  cloud: [
    'aws','azure','gcp','google cloud','kubernetes','docker','terraform','ansible','jenkins','gitlab','github actions','devops','mlops','serverless'
  ],
  architecture: [
    'microservices','api design','system design','scalability','distributed systems','event-driven','event driven','containers','orchestration','ci/cd','kafka','rabbitmq'
  ],
  leadership: [
    'team lead','project management','agile','scrum','mentoring','coaching','stakeholder management','cross-functional','leadership','management'
  ],
  data: [
    'machine learning','ai','data science','analytics','big data','spark','hadoop','tableau','power bi','etl','sql','mongodb','postgresql','mysql','redis','elasticsearch',
    'tensorflow','pytorch','scikit-learn','keras','nlp','natural language processing','computer vision','reinforcement learning'
  ]
} as const

const ROLE_KEYWORDS: Record<string, string[]> = {
  'AI/ML Engineer': ['ai/ml engineer','ai engineer','ml engineer','machine learning engineer','artificial intelligence engineer','senior ai/ml engineer','principal ai engineer','senior ml engineer'],
  'Data Scientist': ['data scientist','principal data scientist','senior data scientist','research scientist','data analyst'],
  'Solution Architect': ['solution architect','solutions architect','enterprise architect','technical architect','system architect','chief architect','principal architect','sr architect','senior architect'],
  'Software Engineer': ['software engineer','software developer','developer','programmer','full stack','backend','frontend','web developer','application developer'],
  'Engineering Manager': ['engineering manager','development manager','team lead','technical lead','lead developer','engineering director','head of engineering'],
  'DevOps Engineer': ['devops engineer','site reliability engineer','infrastructure engineer','platform engineer','cloud engineer','systems engineer'],
  'Product Manager': ['product manager','technical product manager','product owner','program manager'],
  'Consultant': ['consultant','technical consultant','solutions consultant','advisory','principal consultant','senior consultant'],
  'CTO': ['chief technology officer','cto','chief technical officer','vp engineering','vice president engineering'],
  'Director': ['director of engineering','engineering director','technical director','director technology']
}

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
  /(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)/gi,
  /experience[:\s]*(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*years?\s*in/gi,
]

// ----------------------- Public API -----------------------
export async function parseResumeFile(file: File): Promise<ResumeData> {
  try {
    if (file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf')) {
      return await extractFromPdf(file)
    }
    if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      (file.name || '').toLowerCase().endsWith('.docx')
    ) {
      return await extractFromDocx(file)
    }
    if (file.type === 'application/msword' || (file.name || '').toLowerCase().endsWith('.doc')) {
      // Legacy .doc best-effort
      const buf = await file.arrayBuffer()
      const pseudo = new TextDecoder().decode(new Uint8Array(buf))
      const cleaned = cleanDocxText(pseudo)
      const res = analyzeResumeText(cleaned, file)
      res.meta = { ...(res.meta||{}), legacyDoc: true, warning: 'Legacy .doc detected. Convert to PDF/DOCX for best accuracy.' }
      return res
    }
    if (file.type === 'text/plain') {
      const text = await readAsText(file)
      return analyzeResumeText(text, file)
    }
    // Unknown type: try text
    const fallbackText = await readAsText(file)
    return analyzeResumeText(fallbackText, file)
  } catch (err) {
    console.error('Resume parse error:', err)
    return createFallback(file.name, String((err as any)?.message || err))
  }
}

// ----------------------- Extraction helpers -----------------------
async function extractFromPdf(file: File): Promise<ResumeData> {
  const strategies: Array<{name: string; fn: (f: File) => Promise<{ text: string; pages?: number }>}> = [
    { name: 'pdfjs-standard', fn: pdfjsStandard },
    { name: 'pdfjs-robust', fn: pdfjsRobust },
    { name: 'pdfjs-raw', fn: pdfjsRaw },
  ]

  let best: { text: string; pages?: number; method?: string; usedOCR?: boolean } | null = null
  let bestScore = 0

  for (const s of strategies) {
    try {
      const r = await withTimeout(s.fn(file), 12000, s.name)
      const score = scoreText(r.text)
      if (score > bestScore) {
        bestScore = score
        best = { ...r, method: s.name }
      }
      if (score > 50 && r.text.length > 200) break
    } catch (e) {
      // continue
    }
  }

  // OCR fallback if weak result, browser only
  if (
    typeof window !== 'undefined' &&
    (!best || bestScore < 20 || (best.text && best.text.length < 200)) &&
    file.size < 15 * 1024 * 1024
  ) {
    try {
      const ocr = await withTimeout(pdfOcr(file), 45000, 'tesseract-ocr')
      const score = scoreText(ocr.text)
      if (score > bestScore) {
        best = { ...ocr, method: 'tesseract-ocr', usedOCR: true }
        bestScore = score
      }
    } catch (e) {
      // ignore OCR failure
    }
  }

  if (!best || !best.text) return createFallback(file.name, 'Unable to extract text from PDF')

  const cleaned = cleanPdfText(best.text)
  let analyzed = analyzeResumeText(cleaned, file)
  analyzed.meta = {
    ...(analyzed.meta || {}),
    extractor: best.method,
    usedOCR: !!best.usedOCR,
    pages: best.pages || 0,
    textLength: cleaned.length,
    extractionScore: bestScore,
  }

  // Second-pass heuristic: if analysis still looks weak, try OCR even after text extraction
  const looksWeak = (res: ResumeData, textLen: number) => {
    const weakSkills = !res.skills || res.skills.length === 0
    const weakExp = !res.experience || /unable to determine/i.test(res.experience)
    const weakRole = !res.currentRole || /unable to determine/i.test(res.currentRole)
    return (weakSkills || weakExp || weakRole) && textLen < 1500
  }

  if (
    typeof window !== 'undefined' &&
    !analyzed.meta?.usedOCR &&
    looksWeak(analyzed, cleaned.length) &&
    file.size < 15 * 1024 * 1024
  ) {
    try {
      const ocr = await withTimeout(pdfOcr(file), 45000, 'tesseract-ocr')
      const ocrClean = cleanPdfText(ocr.text)
      const analyzedOcr = analyzeResumeText(ocrClean, file)
      // choose better by skills count or text length
      const pickOcr = (analyzedOcr.skills?.length || 0) > (analyzed.skills?.length || 0) || ocrClean.length > cleaned.length
      if (pickOcr) {
        analyzed = analyzedOcr
        analyzed.meta = {
          ...(analyzed.meta || {}),
          extractor: 'tesseract-ocr',
          usedOCR: true,
          pages: ocr.pages || 0,
          textLength: ocrClean.length,
          extractionScore: scoreText(ocrClean),
        }
      }
    } catch {
      // ignore
    }
  }

  return analyzed
}

async function pdfjsStandard(file: File) {
  const pdfjs = await getPdfjs()
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf, useWorker: false, verbosity: 0, disableAutoFetch: true, disableStream: true }).promise
  let out = ''
  const max = Math.min(pdf.numPages, 10)
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    out += tc.items.filter((it: any) => it.str?.trim()).map((it: any) => it.str).join(' ') + '\n'
  }
  return { text: out, pages: pdf.numPages }
}

async function pdfjsRobust(file: File) {
  const pdfjs = await getPdfjs()
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf, useWorker: false, verbosity: 0, disableAutoFetch: true, disableStream: true }).promise
  const lines: string[] = []
  const max = Math.min(pdf.numPages, 5)
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    const lineMap = new Map<number, Array<{ x: number; text: string }>>()
    tc.items.forEach((it: any) => {
      if (!it.str?.trim()) return
      const y = Math.round(it.transform[5])
      const x = it.transform[4]
      if (!lineMap.has(y)) lineMap.set(y, [])
      lineMap.get(y)!.push({ x, text: it.str })
    })
    const ys = Array.from(lineMap.keys()).sort((a, b) => b - a)
    ys.forEach((y) => {
      const line = lineMap.get(y)!.sort((a, b) => a.x - b.x).map((v) => v.text).join(' ').trim()
      if (line.length > 1) lines.push(line)
    })
    if (i < max) lines.push('')
  }
  return { text: lines.join('\n'), pages: pdf.numPages }
}

async function pdfjsRaw(file: File) {
  const pdfjs = await getPdfjs()
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf, useWorker: false, verbosity: 0, disableAutoFetch: true, disableStream: true }).promise
  let out = ''
  const max = Math.min(pdf.numPages, 3)
  for (let i = 1; i <= max; i++) {
    const page = await pdf.getPage(i)
    const tc = await page.getTextContent()
    const pageText = tc.items.filter((it: any) => it.str?.trim()).map((it: any) => it.str).join(' ')
    if (pageText.trim()) out += pageText + '\n\n'
  }
  return { text: out, pages: pdf.numPages }
}

async function pdfOcr(file: File) {
  const pdfjs = await getPdfjs()
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf, useWorker: false, verbosity: 0 }).promise
  const { createWorker }: any = await import('tesseract.js')
  const worker = await createWorker('eng')
  let out = ''
  try {
    const max = Math.min(pdf.numPages, 8)
    for (let i = 1; i <= max; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 2.5 }) // slightly higher scale for better OCR
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise
      const dataUrl = canvas.toDataURL('image/png')
      const { data: { text } } = await worker.recognize(dataUrl)
      out += text + '\n\n'
    }
  } finally {
    await worker.terminate()
  }
  return { text: out, pages: pdf.numPages }
}

// ----------------------- DOCX -----------------------
async function extractFromDocx(file: File): Promise<ResumeData> {
  const buf = await file.arrayBuffer()
  try {
    const mammoth: any = await import('mammoth')
    const { value } = await mammoth.extractRawText({ arrayBuffer: buf })
    const text = cleanDocxText(value)
    const res = analyzeResumeText(text, file)
    res.meta = { ...(res.meta || {}), extractor: 'mammoth' }
    return res
  } catch {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(buf)
    const doc = zip.file('word/document.xml')
    if (!doc) return createFallback(file.name, 'document.xml not found in DOCX')
    const xml = await doc.async('string')
    let text = xml
      .replace(/<w:tab\b[^>]*\/>/g, '\t')
      .replace(/<w:br\b[^>]*\/>/g, '\n')
      .replace(/<w:p\b[^>]*>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<w:t[^>]*>/g, '')
      .replace(/<\/w:t>/g, '')
      .replace(/<[^>]+>/g, '')
    text = decodeXmlEntities(text)
    text = cleanDocxText(text)
    const res = analyzeResumeText(text, file)
    res.meta = { ...(res.meta || {}), extractor: 'jszip' }
    return res
  }
}

function decodeXmlEntities(s: string) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

async function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// ----------------------- Analyzers -----------------------
function analyzeResumeText(text: string, file: File): ResumeData {
  const lower = text.toLowerCase()
  const skills = extractSkills(text, lower)
  const experience = extractExperience(text, lower)
  const currentRole = extractCurrentRole(text, lower)
  const education = extractEducation(text)
  const industry = determineIndustry(lower)

  const result: ResumeData = {
    fileName: file.name,
    fileSize: file.size || 0,
    uploadDate: new Date().toISOString(),
    skills: skills.slice(0, 15),
    experience,
    industry,
    education,
    currentRole,
    rawText: text.substring(0, 500),
  }
  return result
}

function extractSkills(originalText: string, lowerText: string) {
  const found = new Set<string>()
  const all = Object.values(SKILL_KEYWORDS).flat()
  const secRe = /(skills|technical\s+skills|core\s+competencies|technologies)[:\s\n-]*([\s\S]*?)(\n\n|education|experience|projects|certifications|summary)/i
  const m = originalText.match(secRe)
  if (m && m[2]) {
    const section = m[2].replace(/\r\n?/g, '\n').split(/\n|;|\||,|•|\u2022/g).map((s) => s.trim()).filter(Boolean).join(', ').toLowerCase()
    all.forEach((skill) => { if (section.includes(skill.toLowerCase())) found.add(skill) })
  }
  all.forEach((skill) => {
    const k = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\+/g, '\\+')
    try {
      const re = new RegExp(`(^|[^a-z0-9+])${k}([^a-z0-9+]|$)`, 'i')
      if (re.test(lowerText)) found.add(skill)
    } catch {
      if (lowerText.includes(skill.toLowerCase())) found.add(skill)
    }
  })
  const normalize = (s: string) => s
    .replace(/node\.js/i, 'Node.js')
    .replace(/react/i, 'React')
    .replace(/aws/i, 'AWS')
    .replace(/gcp|google cloud/i, 'GCP')
    .replace(/ms sql|sql server/i, 'SQL')
    .replace(/postgres|postgresql/i, 'PostgreSQL')
  return Array.from(found).map(normalize)
}

const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','sept','oct','nov','dec']
const monthToIndex = (m: string) => { const i = MONTHS.indexOf(m.slice(0,3).toLowerCase()); return i >= 0 ? i : 0 }
const parseDateToken = (token: string) => {
  const t = token.trim()
  const yOnly = t.match(/^(19|20)\d{2}$/)
  if (yOnly) return { y: parseInt(yOnly[0], 10), m: 0 }
  const my = t.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,]+(\d{4})$/i)
  if (my) return { y: parseInt(my[2], 10), m: monthToIndex(my[1]) }
  return null
}

function extractExperience(originalText: string, lowerText: string) {
  for (const p of EXPERIENCE_PATTERNS) {
    const matches = lowerText.match(p)
    if (matches) {
      const years = matches[0].match(/\d+/)
      if (years) {
        const n = parseInt(years[0], 10)
        if (n > 0 && n <= 50) return `${n}+ years`
      }
    }
  }
  const text = originalText.replace(/\r\n?/g, '\n')
  const rangeRe = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})\s*[–-]\s*((?:present|current)|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})) /ig
  const now = new Date()
  let months = 0
  const seen = new Set<string>()
  let m: RegExpExecArray | null
  while ((m = rangeRe.exec(text + ' ')) !== null) {
    const startTok = m[1]
    const endTok = m[2]
    const start = parseDateToken(startTok) || (startTok.match(/^(19|20)\d{2}$/) ? { y: parseInt(startTok, 10), m: 0 } : null)
    const end = /present|current/i.test(endTok) ? { y: now.getFullYear(), m: now.getMonth() } : (parseDateToken(endTok) || (endTok.match(/^(19|20)\d{2}$/) ? { y: parseInt(endTok, 10), m: 0 } : null))
    if (start && end) {
      const key = `${start.y}-${start.m}-${end.y}-${end.m}`
      if (seen.has(key)) continue
      seen.add(key)
      const delta = (end.y - start.y) * 12 + (end.m - start.m)
      if (delta > 0 && delta < 50 * 12) months += delta
    }
  }
  if (months > 0) {
    const yrs = months / 12
    if (yrs >= 15) return '15+ years'
    if (yrs >= 10) return '10-15 years'
    if (yrs >= 7) return '7-10 years'
    if (yrs >= 5) return '5-7 years'
    if (yrs >= 3) return '3-5 years'
    if (yrs >= 2) return '2-3 years'
    return '1-2 years'
  }
  const indicators = (lowerText.match(/\b(worked|employed|position|role|job|engineer|developer|architect|manager)\b/g) || []).length
  if (indicators > 8) return '10+ years'
  if (indicators > 5) return '5-10 years'
  if (indicators > 3) return '2-5 years'
  return '1-2 years'
}

function extractCurrentRole(originalText: string, lowerText: string) {
  let best = 'Software Developer'
  let maxScore = 0
  const patterns = [
    /^([A-Za-z\/\s]+Engineer|[A-Za-z\/\s]+Scientist|[A-ZaZ\/\s]+Manager|[A-ZaZ\/\s]+Architect|[A-ZaZ\/\s]+Director)\s*$/gm,
    /(\w+(?:\/\w+)?\s+\w+(?:\s+\w+)?)\s*\|\s*[^\n|]+\s*\|\s*\d{4}[\s–-]*(?:present|current)/gi,
    /current(?:ly)?\s+(?:working\s+as|employed\s+as|position|role)[\s\w]*?([^\n\r.]{1,50})/gi,
    /(?:present|current)[\s-]*([^\n\r.]{1,50})/gi,
  ]
  for (const p of patterns) {
    const matches = originalText.match(p)
    if (matches) {
      for (const match of matches) {
        const slice = match.toLowerCase()
        Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
          keywords.forEach((k) => { if (slice.includes(k.toLowerCase())) { maxScore += 10; best = role } })
        })
      }
    }
  }
  if (maxScore === 0) {
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      let score = 0
      keywords.forEach((k) => {
        const re = new RegExp(k.replace(/\s+/g, '\\s+'), 'gi')
        const matches = lowerText.match(re)
        if (matches) {
          score += matches.length
          const idx = lowerText.indexOf(k.toLowerCase())
          if (idx >= 0 && idx < 500) score += 2
        }
      })
      if (score > maxScore) { maxScore = score; best = role }
    })
  }
  if (maxScore <= 1) {
    const first = originalText.split(/\n/).slice(0, 8).join(' ').toLowerCase()
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      keywords.forEach((k) => { if (first.includes(k.toLowerCase())) { best = role; maxScore = 2 } })
    })
    const expIdx = lowerText.indexOf('experience')
    if (expIdx >= 0) {
      const after = originalText.slice(expIdx, expIdx + 500).toLowerCase()
      Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
        keywords.forEach((k) => { if (after.includes(k.toLowerCase())) { best = role; maxScore = 3 } })
      })
    }
  }
  return best
}

function extractEducation(originalText: string) {
  const text = originalText.toLowerCase()
  const levels: Record<string, { keywords: string[]; level: number }> = {
    'PhD': { keywords: ['phd','ph.d','ph d','doctorate','doctoral','doctor of philosophy','dphil','d.phil'], level: 4 },
    'Masters': { keywords: [
      "masters","master's","master of","msc","m.sc","m sc","mba","m.b.a","m b a",
      'ms','m.s','m s','ma','m.a','m a','meng','m.eng','m eng',
      'master of science','master of arts','master of business','master of engineering',
      'master of computer science','master of technology','mtech','m.tech','m tech'], level: 3 },
    'Bachelors': { keywords: [
      "bachelors","bachelor's","bachelor of","bsc","b.sc","b sc","bs","b.s","b s",
      'ba','b.a','b a','beng','b.eng','b eng','btech','b.tech','b tech',
      'bachelor of science','bachelor of arts','bachelor of engineering','bachelor of technology',
      'bachelor of computer science','undergraduate degree'], level: 2 },
    'Associates': { keywords: [
      "associates","associate's","associate of","aa","a.a","a a","as","a.s","a s",
      'associate degree','associate of arts','associate of science','two year degree'], level: 1 },
    'High School': { keywords: ['high school','secondary school','diploma','ged','hsed','high school diploma','secondary education','matriculation','12th grade','grade 12'], level: 0 },
  }
  let highest = 'High School'
  let highestLevel = -1
  const secRe = /(education|academic|qualifications|degrees)[:\s\n-]*([\s\S]*?)(?:\n\n|experience|skills|projects|certifications|$)/i
  const sec = originalText.match(secRe)
  const searchText = (sec && sec[2] ? sec[2] : text).toLowerCase()
  Object.entries(levels).forEach(([lvl, cfg]) => {
    cfg.keywords.forEach((k) => { if (searchText.includes(k)) { if (cfg.level > highestLevel) { highestLevel = cfg.level; highest = lvl } } })
  })
  // Heuristic: any university mention -> at least Bachelors
  if (highestLevel < 2) {
    const uniRe = /university|college|institute|school\s+of/i
    if (uniRe.test(searchText)) { highest = 'Bachelors'; highestLevel = 2 }
  }
  return highest
}

function determineIndustry(text: string) {
  const industries: Record<string, string[]> = {
    'Technology': ['software','tech','programming','development','engineering','computer','digital'],
    'Finance': ['finance','banking','investment','trading','fintech','financial'],
    'Healthcare': ['healthcare','medical','hospital','clinical','pharmaceutical'],
    'Consulting': ['consulting','advisory','strategy','management consulting'],
    'Education': ['education','teaching','academic','university','school'],
    'Retail': ['retail','ecommerce','sales','customer service'],
    'Manufacturing': ['manufacturing','production','industrial','supply chain']
  }
  let best = 'Technology'
  let scoreBest = 0
  Object.entries(industries).forEach(([ind, keys]) => {
    let s = 0
    keys.forEach((k) => { const m = text.match(new RegExp(k, 'gi')); if (m) s += m.length })
    if (s > scoreBest) { scoreBest = s; best = ind }
  })
  return best
}

// ----------------------- Utils -----------------------
function cleanPdfText(text: string) {
  if (!text) return ''
  return text.replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim()).filter((l) => l.length > 0).join('\n')
}
function cleanDocxText(text: string) {
  if (!text) return ''
  return text.replace(/<[^>]*>/g, ' ').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\r\n?/g, '\n').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 0).join('\n')
}
function scoreText(text: string) {
  if (!text || typeof text !== 'string') return 0
  let score = Math.min(text.length, 5000) * 0.1
  const hints = ['experience','education','skills','work','job','company','university','degree']
  hints.forEach((k) => { if (text.toLowerCase().includes(k)) score += 10 })
  if (text.includes('\n')) score += 5
  if (/\d{4}/.test(text)) score += 10
  if (/@/.test(text)) score += 5
  if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(text)) score += 10
  const gib = (text.match(/[^a-zA-Z0-9\s.,;:!?()-]/g) || []).length / Math.max(text.length, 1)
  if (gib > 0.1) score -= gib * 100
  return Math.max(0, score)
}
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${name} timed out after ${ms}ms`)), ms)) as any,
  ])
}
function createFallback(fileName: string, parseErrorMessage?: string): ResumeData {
  return {
    fileName,
    fileSize: 0,
    uploadDate: new Date().toISOString(),
    skills: ['Unable to parse skills - please try a text file'],
    experience: 'Unable to determine',
    industry: 'Technology',
    education: 'Unable to determine',
    currentRole: 'Unable to determine',
    parseError: true,
    rawText: 'File could not be read',
    parseErrorMessage,
    meta: { error: true },
  }
}
