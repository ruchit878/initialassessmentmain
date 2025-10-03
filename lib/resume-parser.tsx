// Enhanced PDF parsing with multiple extraction methods for maximum reliability

// Dynamically import pdfjs on the client to avoid SSR/bundling issues
let _pdfjsLib: any | null = null
const getPdfjsLib = async () => {
  if (_pdfjsLib) return _pdfjsLib
  if (typeof window === "undefined") throw new Error("PDF parsing is only available in the browser")
  // Use legacy build for better bundler compatibility
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs")
  try {
    // Configure worker to a CDN URL that matches installed version
    const version = (mod as any).version || "5.4.149"
    const workerUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/legacy/build/pdf.worker.min.js`
    if ((mod as any)?.GlobalWorkerOptions) {
      ;(mod as any).GlobalWorkerOptions.workerSrc = workerUrl
      console.log("PDF.js worker configured:", workerUrl)
    }
  } catch (e) {
    console.warn("PDF.js worker configuration failed:", e)
  }
  _pdfjsLib = mod
  return _pdfjsLib
}

const SKILL_KEYWORDS = {
  programming: [
    "javascript",
    "typescript",
    "python",
    "java",
    "c#",
    "c++",
    "r",
    "php",
    "ruby",
    "go",
    "rust",
    "react",
    "next.js",
    "angular",
    "vue",
    "node.js",
    "express",
    "django",
    "flask",
    "spring",
    "spring boot",
    "html",
    "css",
    "graphql",
    "rest",
    "apollo",
  ],
  cloud: [
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "kubernetes",
    "docker",
    "terraform",
    "ansible",
    "jenkins",
    "gitlab",
    "github actions",
    "devops",
    "mlops",
    "serverless",
  ],
  architecture: [
    "microservices",
    "api design",
    "system design",
    "scalability",
    "distributed systems",
    "event-driven",
    "event driven",
    "containers",
    "orchestration",
    "ci/cd",
    "kafka",
    "rabbitmq",
  ],
  leadership: [
    "team lead",
    "project management",
    "agile",
    "scrum",
    "mentoring",
    "coaching",
    "stakeholder management",
    "cross-functional",
    "leadership",
    "management",
  ],
  data: [
    "machine learning",
    "ai",
    "data science",
    "analytics",
    "big data",
    "spark",
    "hadoop",
    "tableau",
    "power bi",
    "etl",
    "sql",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "elasticsearch",
    "tensorflow",
    "pytorch",
    "scikit-learn",
    "keras",
    "nlp",
    "natural language processing",
    "computer vision",
    "reinforcement learning",
  ],
}

const ROLE_KEYWORDS = {
  "AI/ML Engineer": [
    "ai/ml engineer",
    "ai engineer",
    "ml engineer",
    "machine learning engineer",
    "artificial intelligence engineer",
    "senior ai/ml engineer",
    "principal ai engineer",
    "senior ml engineer",
  ],
  "Data Scientist": [
    "data scientist",
    "principal data scientist",
    "senior data scientist",
    "research scientist",
    "data analyst",
  ],
  "Solution Architect": [
    "solution architect",
    "solutions architect",
    "enterprise architect",
    "technical architect",
    "system architect",
    "chief architect",
    "principal architect",
    "sr architect",
    "senior architect",
  ],
  "Software Engineer": [
    "software engineer",
    "software developer",
    "developer",
    "programmer",
    "full stack",
    "backend",
    "frontend",
    "web developer",
    "application developer",
  ],
  "Engineering Manager": [
    "engineering manager",
    "development manager",
    "team lead",
    "technical lead",
    "lead developer",
    "engineering director",
    "head of engineering",
  ],
  "DevOps Engineer": [
    "devops engineer",
    "site reliability engineer",
    "infrastructure engineer",
    "platform engineer",
    "cloud engineer",
    "systems engineer",
  ],
  "Product Manager": ["product manager", "technical product manager", "product owner", "program manager"],
  Consultant: [
    "consultant",
    "technical consultant",
    "solutions consultant",
    "advisory",
    "principal consultant",
    "senior consultant",
  ],
  CTO: ["chief technology officer", "cto", "chief technical officer", "vp engineering", "vice president engineering"],
  Director: ["director of engineering", "engineering director", "technical director", "director technology"],
}

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
  /(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)/gi,
  /experience[:\s]*(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*years?\s*in/gi,
]

const EDUCATION_KEYWORDS = {
  PhD: {
    keywords: ["phd", "ph.d", "ph d", "doctorate", "doctoral", "doctor of philosophy", "dphil", "d.phil"],
    level: 4,
  },
  Masters: {
    keywords: [
      "masters",
      "master's",
      "master of",
      "msc",
      "m.sc",
      "m sc",
      "mba",
      "m.b.a",
      "m b a",
      "ms",
      "m.s",
      "m s",
      "ma",
      "m.a",
      "m a",
      "meng",
      "m.eng",
      "m eng",
      "master of science",
      "master of arts",
      "master of business",
      "master of engineering",
      "master of computer science",
      "master of technology",
      "mtech",
      "m.tech",
      "m tech",
    ],
    level: 3,
  },
  Bachelors: {
    keywords: [
      "bachelors",
      "bachelor's",
      "bachelor of",
      "bsc",
      "b.sc",
      "b sc",
      "bs",
      "b.s",
      "b s",
      "ba",
      "b.a",
      "b a",
      "beng",
      "b.eng",
      "b eng",
      "btech",
      "b.tech",
      "b tech",
      "bachelor of science",
      "bachelor of arts",
      "bachelor of engineering",
      "bachelor of technology",
      "bachelor of computer science",
      "undergraduate degree",
    ],
    level: 2,
  },
  Associates: {
    keywords: [
      "associates",
      "associate's",
      "associate of",
      "aa",
      "a.a",
      "a a",
      "as",
      "a.s",
      "a s",
      "associate degree",
      "associate of arts",
      "associate of science",
      "two year degree",
    ],
    level: 1,
  },
  "High School": {
    keywords: [
      "high school",
      "secondary school",
      "diploma",
      "ged",
      "hsed",
      "high school diploma",
      "secondary education",
      "matriculation",
      "12th grade",
      "grade 12",
    ],
    level: 0,
  },
}

export const parseResumeFile = async (file: File) => {
  try {
    const text = ""

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      return extractTextFromPDF(file)
    } else if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.name.toLowerCase().endsWith(".docx")
    ) {
      return extractTextFromDocx(file)
    } else if (file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc")) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        console.warn("Legacy .doc detected. Please convert to PDF or DOCX for best accuracy.")
        const pseudoText = new TextDecoder().decode(new Uint8Array(arrayBuffer))
        const cleaned = cleanDocxText(pseudoText)
        const res = analyzeResumeText(cleaned, file.name)
        res.meta = {
          legacyDoc: true,
          warning: "Legacy .doc detected. For best accuracy, please convert to PDF or DOCX.",
        }
        return res
      } catch (e) {
        console.error("Error handling .doc file:", e)
        return createFallbackResumeData(file.name)
      }
    } else if (file.type === "text/plain") {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => {
          const extractedText = e.target?.result as string
          const result = analyzeResumeText(extractedText, file.name)
          resolve(result)
        }
        reader.readAsText(file)
      })
    } else {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => {
          let extractedText = e.target?.result as string

          if (
            file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
            file.name.toLowerCase().endsWith(".docx")
          ) {
            extractedText = cleanDocxText(extractedText)
          }

          const result = analyzeResumeText(extractedText, file.name)
          resolve(result)
        }

        reader.onerror = () => {
          resolve(createFallbackResumeData(file.name))
        }

        reader.readAsText(file)
      })
    }
  } catch (error) {
    console.error("Error parsing resume:", error)
    return createFallbackResumeData(file.name)
  }
}

const analyzeResumeText = (text: string, fileName: string) => {
  const lowerText = text.toLowerCase()

  const skills = extractSkills(text, lowerText)
  const experience = extractExperience(text, lowerText)
  const currentRole = extractCurrentRole(text, lowerText)
  const education = extractEducation(text)
  const industry = determineIndustry(lowerText)

  return {
    fileName,
    fileSize: 0,
    uploadDate: new Date().toISOString(),
    skills: skills.slice(0, 15),
    experience,
    industry,
    education,
    currentRole,
    rawText: text.substring(0, 500),
  }
}

const extractSkills = (originalText: string, lowerText: string) => {
  const found = new Set<string>()
  const allKeywords = Object.values(SKILL_KEYWORDS).flat()

  const skillsSectionRegex =
    /(skills|technical\s+skills|core\s+competencies|technologies)[:\s\n-]*([\s\S]*?)(\n\n|education|experience|projects|certifications|summary)/i
  const sectionMatch = originalText.match(skillsSectionRegex)
  if (sectionMatch && sectionMatch[2]) {
    const section = sectionMatch[2]
      .replace(/\r\n?/g, "\n")
      .split(/\n|;|\||,|•|\u2022/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ")
      .toLowerCase()
    allKeywords.forEach((skill) => {
      const k = skill.toLowerCase()
      if (section.includes(k)) found.add(skill)
    })
  }

  const scanTargets = [lowerText]
  scanTargets.forEach((t) => {
    allKeywords.forEach((skill) => {
      const k = skill
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\+/g, "\\+")

      try {
        const re = new RegExp(`(^|[^a-z0-9+])${k}([^a-z0-9+]|$)`, "i")
        if (re.test(t)) found.add(skill)
      } catch (regexError) {
        if (t.includes(skill.toLowerCase())) found.add(skill)
      }
    })
  })

  const normalize = (s: string) =>
    s
      .replace(/node\.js/i, "Node.js")
      .replace(/react/i, "React")
      .replace(/aws/i, "AWS")
      .replace(/gcp|google cloud/i, "GCP")
      .replace(/ms sql|sql server/i, "SQL")
      .replace(/postgres|postgresql/i, "PostgreSQL")

  return Array.from(found).map(normalize)
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec"]
const monthToIndex = (m: string) => {
  const i = MONTHS.indexOf(m.slice(0, 3).toLowerCase())
  return i >= 0 ? i : 0
}

const parseDateToken = (token: string) => {
  const t = token.trim()
  const yOnly = t.match(/^(19|20)\d{2}$/)
  if (yOnly) return { y: Number.parseInt(yOnly[0], 10), m: 0 }
  const my = t.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,]+(\d{4})$/i)
  if (my) return { y: Number.parseInt(my[2], 10), m: monthToIndex(my[1]) }
  return null
}

const extractExperience = (originalText: string, lowerText: string) => {
  for (const pattern of EXPERIENCE_PATTERNS) {
    const matches = lowerText.match(pattern)
    if (matches) {
      const years = matches[0].match(/\d+/)
      if (years) {
        const yearCount = Number.parseInt(years[0], 10)
        if (yearCount > 0 && yearCount <= 50) {
          return `${yearCount}+ years`
        }
      }
    }
  }

  const text = originalText.replace(/\r\n?/g, "\n")
  const rangeRegex =
    /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})\s*[–-]\s*((?:present|current)|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})) /gi
  const now = new Date()
  let totalMonths = 0
  const seen = new Set()

  let m
  while ((m = rangeRegex.exec(text + " ")) !== null) {
    const startTok = m[1]
    const endTok = m[2]
    const start =
      parseDateToken(startTok) || (startTok.match(/^(19|20)\d{2}$/) ? { y: Number.parseInt(startTok, 10), m: 0 } : null)
    const end = /present|current/i.test(endTok)
      ? { y: now.getFullYear(), m: now.getMonth() }
      : parseDateToken(endTok) || (endTok.match(/^(19|20)\d{2}$/) ? { y: Number.parseInt(endTok, 10), m: 0 } : null)
    if (start && end) {
      const key = `${start.y}-${start.m}-${end.y}-${end.m}`
      if (seen.has(key)) continue
      seen.add(key)
      const months = (end.y - start.y) * 12 + (end.m - start.m)
      if (months > 0 && months < 50 * 12) totalMonths += months
    }
  }

  if (totalMonths > 0) {
    const years = totalMonths / 12
    if (years >= 15) return "15+ years"
    if (years >= 10) return "10-15 years"
    if (years >= 7) return "7-10 years"
    if (years >= 5) return "5-7 years"
    if (years >= 3) return "3-5 years"
    if (years >= 2) return "2-3 years"
    return "1-2 years"
  }

  const jobIndicators = (
    lowerText.match(/\b(worked|employed|position|role|job|engineer|developer|architect|manager)\b/g) || []
  ).length
  if (jobIndicators > 8) return "10+ years"
  if (jobIndicators > 5) return "5-10 years"
  if (jobIndicators > 3) return "2-5 years"
  return "1-2 years"
}

const extractCurrentRole = (originalText: string, lowerText: string) => {
  let bestMatch = "Software Developer"
  let maxScore = 0

  const currentRolePatterns = [
    /^([A-Za-z/\s]+Engineer|[A-Za-z/\s]+Scientist|[A-Za-z/\s]+Manager|[A-Za-z/\s]+Architect|[A-Za-z/\s]+Director)\s*$/gm,
    /(\w+(?:\/\w+)?\s+\w+(?:\s+\w+)?)\s*\|\s*[^\n|]+\s*\|\s*\d{4}[\s–-]*(?:present|current)/gi,
    /current(?:ly)?\s+(?:working\s+as|employed\s+as|position|role)[\s\w]*?([^\n\r.]{1,50})/gi,
    /(?:present|current)[\s-]*([^\n\r.]{1,50})/gi,
  ]

  for (const pattern of currentRolePatterns) {
    const matches = originalText.match(pattern)
    if (matches) {
      for (const match of matches) {
        const roleText = match.toLowerCase()
        Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
          keywords.forEach((keyword) => {
            if (roleText.includes(keyword.toLowerCase())) {
              maxScore += 10
              bestMatch = role
            }
          })
        })
      }
    }
  }

  if (maxScore === 0) {
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      let score = 0
      keywords.forEach((keyword) => {
        const regex = new RegExp(keyword.replace(/\s+/g, "\\s+"), "gi")
        const matches = lowerText.match(regex)
        if (matches) {
          score += matches.length

          const firstOccurrence = lowerText.indexOf(keyword.toLowerCase())
          if (firstOccurrence < 500) {
            score += 2
          }
        }
      })

      if (score > maxScore) {
        maxScore = score
        bestMatch = role
      }
    })
  }

  if (maxScore <= 1) {
    const firstLines = originalText.split(/\n/).slice(0, 8).join(" ").toLowerCase()
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      keywords.forEach((k) => {
        if (firstLines.includes(k.toLowerCase())) {
          bestMatch = role
          maxScore = 2
        }
      })
    })

    const expIdx = lowerText.indexOf("experience")
    if (expIdx >= 0) {
      const afterExp = originalText.slice(expIdx, expIdx + 500).toLowerCase()
      Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
        keywords.forEach((k) => {
          if (afterExp.includes(k.toLowerCase())) {
            bestMatch = role
            maxScore = 3
          }
        })
      })
    }
  }

  return bestMatch
}

const extractEducation = (originalText: string) => {
  const text = originalText.toLowerCase()
  let highestEducation = "High School"
  let highestLevel = -1
  const foundEducations: any[] = []

  const educationSectionRegex =
    /(education|academic|qualifications|degrees)[:\s\n-]*([\s\S]*?)(?:\n\n|experience|skills|projects|certifications|$)/i
  const sectionMatch = originalText.match(educationSectionRegex)
  let searchText = text

  if (sectionMatch && sectionMatch[2]) {
    searchText = sectionMatch[2].toLowerCase()
  }

  Object.entries(EDUCATION_KEYWORDS).forEach(([level, config]) => {
    config.keywords.forEach((keyword) => {
      if (searchText.includes(keyword)) {
        foundEducations.push({ level, keyword, levelNum: config.level })

        if (config.level > highestLevel) {
          highestLevel = config.level
          highestEducation = level
        }
      }
    })
  })

  const degreePatterns = [
    /ph\.?d|doctorate|doctoral/i,
    /m\.?[sa]\.?|m\.?sc\.?|m\.?ba\.?|m\.?eng\.?|m\.?tech\.?|master[\s']?s?\s+(?:of|in|degree)/i,
    /b\.?[sa]\.?|b\.?sc\.?|b\.?eng\.?|b\.?tech\.?|bachelor[\s']?s?\s+(?:of|in|degree)/i,
    /a\.?[sa]\.?|associate[\s']?s?\s+(?:of|in|degree)/i,
  ]

  const patternLevels = ["PhD", "Masters", "Bachelors", "Associates"]

  degreePatterns.forEach((pattern, index) => {
    if (pattern.test(searchText)) {
      const level = patternLevels[index]
      const levelNum = EDUCATION_KEYWORDS[level].level

      if (levelNum > highestLevel) {
        highestLevel = levelNum
        highestEducation = level
        foundEducations.push({ level, keyword: "pattern-match", levelNum })
      }
    }
  })

  const universityPatterns = [
    /university|college|institute|school\s+of/i,
    /stanford|mit|harvard|berkeley|carnegie|caltech/i,
    /\b[a-z]+\s+university\b/i,
    /\b[a-z]+\s+college\b/i,
  ]

  let hasUniversity = false
  universityPatterns.forEach((pattern) => {
    if (pattern.test(searchText)) {
      hasUniversity = true
    }
  })

  if (hasUniversity && highestLevel < 2) {
    highestEducation = "Bachelors"
    highestLevel = 2
    foundEducations.push({ level: "Bachelors", keyword: "university-inference", levelNum: 2 })
  }

  return highestEducation
}

const determineIndustry = (text: string) => {
  const industries: Record<string, string[]> = {
    Technology: ["software", "tech", "programming", "development", "engineering", "computer", "digital"],
    Finance: ["finance", "banking", "investment", "trading", "fintech", "financial"],
    Healthcare: ["healthcare", "medical", "hospital", "clinical", "pharmaceutical"],
    Consulting: ["consulting", "advisory", "strategy", "management consulting"],
    Education: ["education", "teaching", "academic", "university", "school"],
    Retail: ["retail", "ecommerce", "sales", "customer service"],
    Manufacturing: ["manufacturing", "production", "industrial", "supply chain"],
  }

  let bestMatch = "Technology"
  let maxScore = 0

  Object.entries(industries).forEach(([industry, keywords]) => {
    let score = 0
    keywords.forEach((keyword) => {
      const matches = text.match(new RegExp(keyword, "gi"))
      if (matches) {
        score += matches.length
      }
    })

    if (score > maxScore) {
      maxScore = score
      bestMatch = industry
    }
  })

  return bestMatch
}

const cleanPdfText = (text: string) => {
  if (!text) return ""
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) =>
      line
        .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((line) => line.length > 0)
    .join("\n")
  return normalized
}

const cleanDocxText = (text: string) => {
  if (!text) return ""

  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n")
}

const extractTextFromPDF = async (file: File) => {
  console.log("=== ENHANCED PDF PARSING START ===")
  console.log("File name:", file.name, "Size:", file.size, "Type:", file.type)

  const withTimeout = (promise: Promise<any>, timeoutMs: number, methodName: string) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`${methodName} timed out after ${timeoutMs}ms`)), timeoutMs),
      ),
    ])
  }

  const methods = [
    { name: "pdfjs-standard", fn: extractWithPdfJsStandard, timeout: 10000 },
    { name: "pdfjs-robust", fn: extractWithPdfJsRobust, timeout: 15000 },
    { name: "pdfjs-raw", fn: extractWithPdfJsRaw, timeout: 8000 },
  ]

  let bestResult: any = null
  let bestScore = 0

  for (const method of methods) {
    try {
      console.log(`Trying extraction method: ${method.name} (timeout: ${method.timeout}ms)`)
      const result = await withTimeout(method.fn(file), method.timeout, method.name)
      const score = scoreExtractedText(result.text)
      console.log(`Method ${method.name} - Text length: ${result.text.length}, Score: ${score}`)

      if (score > bestScore) {
        bestScore = score
        bestResult = { ...result, method: method.name }
      }

      if (score > 50 && result.text.length > 100) {
        console.log(`Good result found with ${method.name}, using it`)
        break
      }
    } catch (error: any) {
      console.warn(`Method ${method.name} failed:`, error.message)
    }
  }

  if (!bestResult || !bestResult.text) {
    console.error("All PDF extraction methods failed")
    return createFallbackResumeData(file.name, "All PDF extraction methods failed")
  }

  const cleanedText = cleanPdfText(bestResult.text)
  console.log("Final extracted text (first 500 chars):", cleanedText.substring(0, 500))
  console.log("=== ENHANCED PDF PARSING END ===")

  const result = analyzeResumeText(cleanedText, file.name)
  result.meta = {
    extractor: bestResult.method,
    usedOCR: bestResult.usedOCR || false,
    pages: bestResult.pages || 0,
    textLength: cleanedText.length,
    extractionScore: bestScore,
  }

  return result
}

const scoreExtractedText = (text: string) => {
  if (!text || typeof text !== "string") return 0

  let score = text.length * 0.1

  const resumeKeywords = ["experience", "education", "skills", "work", "job", "company", "university", "degree"]
  resumeKeywords.forEach((keyword) => {
    if (text.toLowerCase().includes(keyword)) score += 10
  })

  if (text.includes("\n")) score += 5
  if (/\d{4}/.test(text)) score += 10
  if (/@/.test(text)) score += 5
  if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(text)) score += 10

  const gibberishRatio = (text.match(/[^a-zA-Z0-9\s.,;:!?()-]/g) || []).length / text.length
  if (gibberishRatio > 0.1) score -= gibberishRatio * 100

  return Math.max(0, score)
}

const extractWithPdfJsStandard = async (file: File) => {
  const pdfjsLib = await getPdfjsLib()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true,
  }).promise

  let fullText = ""
  const maxPages = Math.min(pdf.numPages, 10)

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .filter((item: any) => item.str && item.str.trim())
      .map((item: any) => item.str)
      .join(" ")
    fullText += pageText + "\n"
  }

  return { text: fullText, pages: pdf.numPages }
}

const extractWithPdfJsRobust = async (file: File) => {
  const pdfjsLib = await getPdfjsLib()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true,
  }).promise

  const allLines: string[] = []
  const maxPages = Math.min(pdf.numPages, 5)

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const lineMap = new Map()

    textContent.items.forEach((item: any) => {
      if (!item.str || !item.str.trim()) return

      const y = Math.round(item.transform[5])
      const x = item.transform[4]

      if (!lineMap.has(y)) {
        lineMap.set(y, [])
      }

      lineMap.get(y).push({ x, text: item.str })
    })

    const sortedYs = Array.from(lineMap.keys()).sort((a: any, b: any) => b - a)

    sortedYs.forEach((y) => {
      const lineItems = lineMap.get(y).sort((a: any, b: any) => a.x - b.x)
      const lineText = lineItems
        .map((item: any) => item.text)
        .join(" ")
        .trim()
      if (lineText && lineText.length > 1) {
        allLines.push(lineText)
      }
    })

    if (pageNum < maxPages) allLines.push("")
  }

  return { text: allLines.join("\n"), pages: pdf.numPages }
}

const extractWithPdfJsRaw = async (file: File) => {
  const pdfjsLib = await getPdfjsLib()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true,
  }).promise

  let rawText = ""
  const maxPages = Math.min(pdf.numPages, 3)

  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const pageText = textContent.items
      .filter((item: any) => item.str && item.str.trim().length > 0)
      .map((item: any) => item.str)
      .join(" ")

    if (pageText.trim()) {
      rawText += pageText + "\n\n"
    }
  }

  return { text: rawText, pages: pdf.numPages }
}

const extractTextFromDocx = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  try {
    const mammoth = await import("mammoth")
    const { value } = await mammoth.extractRawText({ arrayBuffer })
    const text = cleanDocxText(value)
    const result = analyzeResumeText(text, file.name)
    result.meta = { extractor: "mammoth" }
    return result
  } catch (mammothError) {
    console.warn("Mammoth failed, attempting JSZip fallback...", mammothError)
    try {
      const result = await fallbackExtractDocxWithZip(arrayBuffer, file.name)
      return result
    } catch (zipError) {
      console.error("DOCX JSZip fallback failed:", zipError)
      return createFallbackResumeData(file.name, String((mammothError as any)?.message || mammothError))
    }
  }
}

const fallbackExtractDocxWithZip = async (arrayBuffer: ArrayBuffer, fileName: string) => {
  const JSZip = (await import("jszip")).default
  const zip = await JSZip.loadAsync(arrayBuffer)
  const docFile = zip.file("word/document.xml")
  if (!docFile) {
    throw new Error("document.xml not found in DOCX")
  }
  const xml = await docFile.async("string")
  let text = xml
    .replace(/<w:tab\b[^>]*\/>/g, "\t")
    .replace(/<w:br\b[^>]*\/>/g, "\n")
    .replace(/<w:p\b[^>]*>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:t[^>]*>/g, "")
    .replace(/<\/w:t>/g, "")
    .replace(/<[^>]+>/g, "")
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
  text = cleanDocxText(text)
  const result = analyzeResumeText(text, fileName)
  result.meta = { extractor: "jszip" }
  return result
}

const createFallbackResumeData = (fileName: string, parseErrorMessage?: string) => {
  return {
    fileName,
    fileSize: 0,
    uploadDate: new Date().toISOString(),
    skills: ["Unable to parse skills - please try a text file"],
    experience: "Unable to determine",
    industry: "Technology",
    education: "Unable to determine",
    currentRole: "Unable to determine",
    parseError: true,
    rawText: "File could not be read",
    parseErrorMessage,
    meta: { error: true },
  }
}
