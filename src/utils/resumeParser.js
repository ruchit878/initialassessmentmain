// Enhanced PDF parsing with multiple extraction methods for maximum reliability
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with multiple fallback options
const configurePdfWorker = () => {
  try {
    if (typeof window !== 'undefined' && pdfjsLib?.GlobalWorkerOptions) {
      // Try multiple worker sources for reliability
      const workerSources = [
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
        'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
        '/pdf.worker.min.js' // Local fallback
      ];
      
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
      console.log('PDF.js worker configured:', workerSources[0]);
    }
  } catch (e) {
    console.warn('PDF.js worker configuration failed:', e);
  }
};

// Initialize worker configuration
configurePdfWorker();

// Keywords for different categories
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
};

const ROLE_KEYWORDS = {
  'AI/ML Engineer': ['ai/ml engineer', 'ai engineer', 'ml engineer', 'machine learning engineer', 'artificial intelligence engineer', 'senior ai/ml engineer', 'principal ai engineer', 'senior ml engineer'],
  'Data Scientist': ['data scientist', 'principal data scientist', 'senior data scientist', 'research scientist', 'data analyst'],
  'Solution Architect': ['solution architect', 'solutions architect', 'enterprise architect', 'technical architect', 'system architect', 'chief architect', 'principal architect', 'sr architect', 'senior architect'],
  'Software Engineer': ['software engineer', 'software developer', 'developer', 'programmer', 'full stack', 'backend', 'frontend', 'web developer', 'application developer'],
  'Engineering Manager': ['engineering manager', 'development manager', 'team lead', 'technical lead', 'lead developer', 'engineering director', 'head of engineering'],
  'DevOps Engineer': ['devops engineer', 'site reliability engineer', 'infrastructure engineer', 'platform engineer', 'cloud engineer', 'systems engineer'],
  'Product Manager': ['product manager', 'technical product manager', 'product owner', 'program manager'],
  'Consultant': ['consultant', 'technical consultant', 'solutions consultant', 'advisory', 'principal consultant', 'senior consultant'],
  'CTO': ['chief technology officer', 'cto', 'chief technical officer', 'vp engineering', 'vice president engineering'],
  'Director': ['director of engineering', 'engineering director', 'technical director', 'director technology']
};

const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi,
  /(\d+)\+?\s*yrs?\s*(?:of\s*)?(?:experience|exp)/gi,
  /experience[:\s]*(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*years?\s*in/gi
];

const EDUCATION_KEYWORDS = {
  'PhD': {
    keywords: ['phd', 'ph.d', 'ph d', 'doctorate', 'doctoral', 'doctor of philosophy', 'dphil', 'd.phil'],
    level: 4
  },
  'Masters': {
    keywords: [
      'masters', 'master\'s', 'master of', 'msc', 'm.sc', 'm sc', 'mba', 'm.b.a', 'm b a',
      'ms', 'm.s', 'm s', 'ma', 'm.a', 'm a', 'meng', 'm.eng', 'm eng',
      'master of science', 'master of arts', 'master of business', 'master of engineering',
      'master of computer science', 'master of technology', 'mtech', 'm.tech', 'm tech'
    ],
    level: 3
  },
  'Bachelors': {
    keywords: [
      'bachelors', 'bachelor\'s', 'bachelor of', 'bsc', 'b.sc', 'b sc', 'bs', 'b.s', 'b s',
      'ba', 'b.a', 'b a', 'beng', 'b.eng', 'b eng', 'btech', 'b.tech', 'b tech',
      'bachelor of science', 'bachelor of arts', 'bachelor of engineering',
      'bachelor of technology', 'bachelor of computer science', 'undergraduate degree'
    ],
    level: 2
  },
  'Associates': {
    keywords: [
      'associates', 'associate\'s', 'associate of', 'aa', 'a.a', 'a a', 'as', 'a.s', 'a s',
      'associate degree', 'associate of arts', 'associate of science', 'two year degree'
    ],
    level: 1
  },
  'High School': {
    keywords: [
      'high school', 'secondary school', 'diploma', 'ged', 'hsed', 'high school diploma',
      'secondary education', 'matriculation', '12th grade', 'grade 12'
    ],
    level: 0
  }
};

export const parseResumeFile = async (file) => {
  try {
    let text = '';
    
    // Handle different file types with proper extraction methods
    if (file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf')) {
      return extractTextFromPDF(file);
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      (file.name || '').toLowerCase().endsWith('.docx')
    ) {
      return extractTextFromDocx(file);
    } else if (file.type === 'application/msword' || (file.name || '').toLowerCase().endsWith('.doc')) {
      // Legacy .doc files are not reliably parsable in-browser; attempt ArrayBuffer then fallback
      try {
        const arrayBuffer = await file.arrayBuffer();
        // There's no high-fidelity .doc parser in-browser; provide user guidance
        console.warn('Legacy .doc detected. Please convert to PDF or DOCX for best accuracy.');
        // Best-effort: try reading as text (often gibberish). We'll still analyze to extract anything useful.
        const pseudoText = new TextDecoder().decode(new Uint8Array(arrayBuffer));
        const cleaned = cleanDocxText(pseudoText);
        const res = analyzeResumeText(cleaned, file.name);
        // Attach metadata so UI can inform the user
        res.meta = {
          legacyDoc: true,
          warning: 'Legacy .doc detected. For best accuracy, please convert to PDF or DOCX.'
        };
        return res;
      } catch (e) {
        console.error('Error handling .doc file:', e);
        return createFallbackResumeData(file.name);
      }
    } else if (file.type === 'text/plain') {
      // For text files, we can directly read the content
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          const extractedText = e.target.result;
          
          // Debug logging
          console.log('=== RESUME PARSING DEBUG ===');
          console.log('File name:', file.name);
          console.log('File type:', file.type);
          console.log('Extracted text (first 500 chars):', extractedText.substring(0, 500));
          console.log('Text length:', extractedText.length);
          
          // Test role detection specifically
          console.log('Testing role detection...');
          const roleMatches = [];
          Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
            keywords.forEach(keyword => {
              if (extractedText.toLowerCase().includes(keyword.toLowerCase())) {
                roleMatches.push({ role, keyword, found: true });
              }
            });
          });
          console.log('Role matches found:', roleMatches);
          
          const result = analyzeResumeText(extractedText, file.name);
          console.log('Parsed result:', result);
          console.log('=== END DEBUG ===');
          
          resolve(result);
        };
        reader.readAsText(file);
      });
    } else {
      // For other file types (DOCX, etc.), try basic text extraction
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          let extractedText = e.target.result;
          
          if (
            file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            (file.name || '').toLowerCase().endsWith('.docx')
          ) {
            // If we got here, FileReader.readAsText was used, which is not ideal for DOCX
            // Clean obvious XML artifacts as a fallback (primary path should use mammoth)
            extractedText = cleanDocxText(extractedText);
          }
          
          // Debug logging
          console.log('=== RESUME PARSING DEBUG ===');
          console.log('File name:', file.name);
          console.log('File type:', file.type);
          console.log('Extracted text (first 500 chars):', extractedText.substring(0, 500));
          console.log('Text length:', extractedText.length);
          
          // Test role detection specifically
          console.log('Testing role detection...');
          const roleMatches = [];
          Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
            keywords.forEach(keyword => {
              if (extractedText.toLowerCase().includes(keyword.toLowerCase())) {
                roleMatches.push({ role, keyword, found: true });
              }
            });
          });
          console.log('Role matches found:', roleMatches);
          
          const result = analyzeResumeText(extractedText, file.name);
          console.log('Parsed result:', result);
          console.log('=== END DEBUG ===');
          
          resolve(result);
        };
        
        reader.onerror = () => {
          resolve(createFallbackResumeData(file.name));
        };
        
        reader.readAsText(file);
      });
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    return createFallbackResumeData(file.name);
  }
};

const analyzeResumeText = (text, fileName) => {
  const lowerText = text.toLowerCase();
  
  // Extract skills
  const skills = extractSkills(text, lowerText);
  
  // Extract experience (compute total years from date ranges and explicit mentions)
  const experience = extractExperience(text, lowerText);
  
  // Extract current role
  const currentRole = extractCurrentRole(text, lowerText);
  
  // Extract education (pass original text for better parsing)
  const education = extractEducation(text);
  
  // Determine industry (simplified)
  const industry = determineIndustry(lowerText);
  
  return {
    fileName,
    fileSize: 0, // We don't have access to file size in text parsing
    uploadDate: new Date().toISOString(),
    skills: skills.slice(0, 15), // Top skills (expanded)
    experience,
    industry,
    education,
    currentRole,
    rawText: text.substring(0, 500) // First 500 chars for debugging
  };
};

const extractSkills = (originalText, lowerText) => {
  const found = new Set();
  const allKeywords = Object.values(SKILL_KEYWORDS).flat();

  // 1) Prioritize SKILLS section if present
  const skillsSectionRegex = /(skills|technical\s+skills|core\s+competencies|technologies)[:\s\n-]*([\s\S]*?)(\n\n|education|experience|projects|certifications|summary)/i;
  const sectionMatch = originalText.match(skillsSectionRegex);
  if (sectionMatch && sectionMatch[2]) {
    const section = sectionMatch[2]
      .replace(/\r\n?/g, '\n')
      .split(/\n|;|\||,|•|\u2022/g)
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ')
      .toLowerCase();
    allKeywords.forEach(skill => {
      const k = skill.toLowerCase();
      if (section.includes(k)) found.add(skill);
    });
  }

  // 2) Also scan bullets and body for known keywords
  const scanTargets = [lowerText];
  scanTargets.forEach(t => {
    allKeywords.forEach(skill => {
      // Escape special regex characters properly
      const k = skill.toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\+/g, '\\+'); // Specifically handle + in c++
      
      try {
        const re = new RegExp(`(^|[^a-z0-9+])${k}([^a-z0-9+]|$)`, 'i');
        if (re.test(t)) found.add(skill);
      } catch (regexError) {
        // Fallback to simple includes for problematic patterns
        if (t.includes(skill.toLowerCase())) found.add(skill);
      }
    });
  });

  // Normalize common variants
  const normalize = (s) => s
    .replace(/node\.js/i, 'Node.js')
    .replace(/react/i, 'React')
    .replace(/aws/i, 'AWS')
    .replace(/gcp|google cloud/i, 'GCP')
    .replace(/ms sql|sql server/i, 'SQL')
    .replace(/postgres|postgresql/i, 'PostgreSQL');

  return Array.from(found).map(normalize);
};

// Helpers for date parsing
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','sept','oct','nov','dec'];
const monthToIndex = (m) => {
  const i = MONTHS.indexOf(m.slice(0,3).toLowerCase());
  return i >= 0 ? i : 0;
};

const parseDateToken = (token) => {
  // Supported: YYYY, Mon YYYY, Month YYYY
  const t = token.trim();
  const yOnly = t.match(/^(19|20)\d{2}$/);
  if (yOnly) return { y: parseInt(yOnly[0], 10), m: 0 };
  const my = t.match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,]+(\d{4})$/i);
  if (my) return { y: parseInt(my[2], 10), m: monthToIndex(my[1]) };
  return null;
};

const extractExperience = (originalText, lowerText) => {
  // 1) If explicit "X years of experience" present, trust it
  for (const pattern of EXPERIENCE_PATTERNS) {
    const matches = lowerText.match(pattern);
    if (matches) {
      const years = matches[0].match(/\d+/);
      if (years) {
        const yearCount = parseInt(years[0], 10);
        if (yearCount > 0 && yearCount <= 50) {
          return `${yearCount}+ years`;
        }
      }
    }
  }

  // 2) Compute from date ranges like "2015 - 2020", "2018 - Present", "Jan 2020 - Mar 2023"
  const text = originalText.replace(/\r\n?/g, '\n');
  const rangeRegex = /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})\s*[–-]\s*((?:present|current)|(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}|\d{4})) /ig;
  const now = new Date();
  let totalMonths = 0;
  const seen = new Set();

  let m;
  while ((m = rangeRegex.exec(text + ' ')) !== null) {
    const startTok = m[1];
    const endTok = m[2];
    const start = parseDateToken(startTok) || (startTok.match(/^(19|20)\d{2}$/) ? { y: parseInt(startTok,10), m:0 } : null);
    const end = /present|current/i.test(endTok)
      ? { y: now.getFullYear(), m: now.getMonth() }
      : (parseDateToken(endTok) || (endTok.match(/^(19|20)\d{2}$/) ? { y: parseInt(endTok,10), m:0 } : null));
    if (start && end) {
      const key = `${start.y}-${start.m}-${end.y}-${end.m}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const months = (end.y - start.y) * 12 + (end.m - start.m);
      if (months > 0 && months < 50 * 12) totalMonths += months;
    }
  }

  if (totalMonths > 0) {
    const years = totalMonths / 12;
    if (years >= 15) return '15+ years';
    if (years >= 10) return '10-15 years';
    if (years >= 7) return '7-10 years';
    if (years >= 5) return '5-7 years';
    if (years >= 3) return '3-5 years';
    if (years >= 2) return '2-3 years';
    return '1-2 years';
  }

  // 3) Fallback heuristics
  const jobIndicators = (lowerText.match(/\b(worked|employed|position|role|job|engineer|developer|architect|manager)\b/g) || []).length;
  if (jobIndicators > 8) return '10+ years';
  if (jobIndicators > 5) return '5-10 years';
  if (jobIndicators > 3) return '2-5 years';
  return '1-2 years';
};

const extractCurrentRole = (originalText, lowerText) => {
  // Enhanced role detection with context analysis
  let bestMatch = 'Software Developer'; // default
  let maxScore = 0;
  
  // Look for current role indicators (recent positions)
  const currentRolePatterns = [
    /^([A-Za-z\/\s]+Engineer|[A-Za-z\/\s]+Scientist|[A-Za-z\/\s]+Manager|[A-Za-z\/\s]+Architect|[A-Za-z\/\s]+Director)\s*$/gm,
    /(\w+(?:\/\w+)?\s+\w+(?:\s+\w+)?)\s*\|\s*[^\n|]+\s*\|\s*\d{4}[\s–-]*(?:present|current)/gi,
    /current(?:ly)?\s+(?:working\s+as|employed\s+as|position|role)[\s\w]*?([^\n\r.]{1,50})/gi,
    /(?:present|current)[\s\-]*([^\n\r.]{1,50})/gi
  ];
  
  // First, try to find explicit current role mentions
  for (const pattern of currentRolePatterns) {
    const matches = originalText.match(pattern);
    if (matches) {
      for (const match of matches) {
        const roleText = match.toLowerCase();
        Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
          keywords.forEach(keyword => {
            if (roleText.includes(keyword.toLowerCase())) {
              maxScore += 10; // Higher weight for current role mentions
              bestMatch = role;
            }
          });
        });
      }
    }
  }
  
  // If no current role found, analyze overall content
  if (maxScore === 0) {
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        const regex = new RegExp(keyword.replace(/\s+/g, '\\s+'), 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length;
          
          // Give extra weight if found near beginning of resume
          const firstOccurrence = lowerText.indexOf(keyword.toLowerCase());
          if (firstOccurrence < 500) {
            score += 2;
          }
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = role;
      }
    });
  }

  // Final tie-breakers: look at first lines and first role under EXPERIENCE
  if (maxScore <= 1) {
    const firstLines = originalText.split(/\n/).slice(0, 8).join(' ').toLowerCase();
    Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
      keywords.forEach(k => {
        if (firstLines.includes(k.toLowerCase())) {
          bestMatch = role;
          maxScore = 2;
        }
      });
    });

    const expIdx = lowerText.indexOf('experience');
    if (expIdx >= 0) {
      const afterExp = originalText.slice(expIdx, expIdx + 500).toLowerCase();
      Object.entries(ROLE_KEYWORDS).forEach(([role, keywords]) => {
        keywords.forEach(k => {
          if (afterExp.includes(k.toLowerCase())) {
            bestMatch = role;
            maxScore = 3;
          }
        });
      });
    }
  }
  
  return bestMatch;
};

const extractEducation = (originalText) => {
  const text = originalText.toLowerCase();
  let highestEducation = 'High School';
  let highestLevel = -1;
  const foundEducations = [];
  
  // First, look for education section specifically
  const educationSectionRegex = /(education|academic|qualifications|degrees)[:\s\n-]*([\s\S]*?)(?:\n\n|experience|skills|projects|certifications|$)/i;
  const sectionMatch = originalText.match(educationSectionRegex);
  let searchText = text;
  
  if (sectionMatch && sectionMatch[2]) {
    // Focus on education section if found
    searchText = sectionMatch[2].toLowerCase();
    console.log('Found education section:', searchText.substring(0, 200));
  }
  
  // Check each education level
  Object.entries(EDUCATION_KEYWORDS).forEach(([level, config]) => {
    config.keywords.forEach(keyword => {
      if (searchText.includes(keyword)) {
        foundEducations.push({ level, keyword, levelNum: config.level });
        
        if (config.level > highestLevel) {
          highestLevel = config.level;
          highestEducation = level;
        }
      }
    });
  });
  
  // Enhanced pattern matching for degree formats
  const degreePatterns = [
    // PhD patterns
    /ph\.?d|doctorate|doctoral/i,
    // Masters patterns  
    /m\.?[sa]\.?|m\.?sc\.?|m\.?ba\.?|m\.?eng\.?|m\.?tech\.?|master[\s']?s?\s+(?:of|in|degree)/i,
    // Bachelors patterns
    /b\.?[sa]\.?|b\.?sc\.?|b\.?eng\.?|b\.?tech\.?|bachelor[\s']?s?\s+(?:of|in|degree)/i,
    // Associates patterns
    /a\.?[sa]\.?|associate[\s']?s?\s+(?:of|in|degree)/i
  ];
  
  const patternLevels = ['PhD', 'Masters', 'Bachelors', 'Associates'];
  
  degreePatterns.forEach((pattern, index) => {
    if (pattern.test(searchText)) {
      const level = patternLevels[index];
      const levelNum = EDUCATION_KEYWORDS[level].level;
      
      if (levelNum > highestLevel) {
        highestLevel = levelNum;
        highestEducation = level;
        foundEducations.push({ level, keyword: 'pattern-match', levelNum });
      }
    }
  });
  
  // Look for university names which usually indicate at least bachelor's
  const universityPatterns = [
    /university|college|institute|school\s+of/i,
    /stanford|mit|harvard|berkeley|carnegie|caltech/i,
    /\b[a-z]+\s+university\b/i,
    /\b[a-z]+\s+college\b/i
  ];
  
  let hasUniversity = false;
  universityPatterns.forEach(pattern => {
    if (pattern.test(searchText)) {
      hasUniversity = true;
    }
  });
  
  // If we found university but no specific degree, assume bachelor's minimum
  if (hasUniversity && highestLevel < 2) {
    highestEducation = 'Bachelors';
    highestLevel = 2;
    foundEducations.push({ level: 'Bachelors', keyword: 'university-inference', levelNum: 2 });
  }
  
  console.log('Education analysis:', {
    foundEducations,
    highestEducation,
    highestLevel,
    hasUniversity,
    searchTextLength: searchText.length
  });
  
  return highestEducation;
};

const determineIndustry = (text) => {
  const industries = {
    'Technology': ['software', 'tech', 'programming', 'development', 'engineering', 'computer', 'digital'],
    'Finance': ['finance', 'banking', 'investment', 'trading', 'fintech', 'financial'],
    'Healthcare': ['healthcare', 'medical', 'hospital', 'clinical', 'pharmaceutical'],
    'Consulting': ['consulting', 'advisory', 'strategy', 'management consulting'],
    'Education': ['education', 'teaching', 'academic', 'university', 'school'],
    'Retail': ['retail', 'ecommerce', 'sales', 'customer service'],
    'Manufacturing': ['manufacturing', 'production', 'industrial', 'supply chain']
  };
  
  let bestMatch = 'Technology'; // default
  let maxScore = 0;
  
  Object.entries(industries).forEach(([industry, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      const matches = text.match(new RegExp(keyword, 'gi'));
      if (matches) {
        score += matches.length;
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = industry;
    }
  });
  
  return bestMatch;
};

// Clean PDF text extraction artifacts while preserving line breaks
const cleanPdfText = (text) => {
  if (!text) return '';
  // Normalize line endings and trim trailing spaces per line
  const normalized = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');
  return normalized;
};

// Clean DOCX text extraction artifacts
const cleanDocxText = (text) => {
  if (!text) return '';
  
  // DOCX files might have XML artifacts when read as text
  return text
    .replace(/<[^>]*>/g, ' ') // Remove XML tags
    .replace(/[\x00-\x1F\x7F-\x9F]/g, ' ') // Remove control characters
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 0)
    .join('\n');
};

// Enhanced PDF text extraction with timeout and error handling
const extractTextFromPDF = async (file) => {
  console.log('=== ENHANCED PDF PARSING START ===');
  console.log('File name:', file.name, 'Size:', file.size, 'Type:', file.type);
  
  // Add timeout wrapper
  const withTimeout = (promise, timeoutMs, methodName) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`${methodName} timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  };
  
  const methods = [
    { name: 'pdfjs-standard', fn: extractWithPdfJsStandard, timeout: 10000 },
    { name: 'pdfjs-robust', fn: extractWithPdfJsRobust, timeout: 15000 },
    { name: 'pdfjs-raw', fn: extractWithPdfJsRaw, timeout: 8000 }
  ];
  
  let bestResult = null;
  let bestScore = 0;
  
  for (const method of methods) {
    try {
      console.log(`Trying extraction method: ${method.name} (timeout: ${method.timeout}ms)`);
      const result = await withTimeout(method.fn(file), method.timeout, method.name);
      const score = scoreExtractedText(result.text);
      console.log(`Method ${method.name} - Text length: ${result.text.length}, Score: ${score}`);
      
      if (score > bestScore) {
        bestScore = score;
        bestResult = { ...result, method: method.name };
      }
      
      // If we get a good result, use it immediately
      if (score > 50 && result.text.length > 100) {
        console.log(`Good result found with ${method.name}, using it`);
        break;
      }
    } catch (error) {
      console.warn(`Method ${method.name} failed:`, error.message);
    }
  }
  
  // Only try OCR if we have no good results and the file is small enough
  if ((!bestResult || bestScore < 20) && file.size < 5 * 1024 * 1024) { // 5MB limit for OCR
    console.log('Trying OCR as last resort...');
    try {
      const ocrResult = await withTimeout(
        extractWithTesseractOCR(file), 
        30000, // 30 second timeout for OCR
        'tesseract-ocr'
      );
      const ocrScore = scoreExtractedText(ocrResult.text);
      console.log(`OCR - Text length: ${ocrResult.text.length}, Score: ${ocrScore}`);
      
      if (ocrScore > bestScore) {
        bestResult = { ...ocrResult, method: 'tesseract-ocr', usedOCR: true };
        bestScore = ocrScore;
      }
    } catch (ocrError) {
      console.error('OCR extraction failed:', ocrError.message);
    }
  }
  
  if (!bestResult || !bestResult.text) {
    console.error('All PDF extraction methods failed');
    return createFallbackResumeData(file.name, 'All PDF extraction methods failed');
  }
  
  const cleanedText = cleanPdfText(bestResult.text);
  console.log('Final extracted text (first 500 chars):', cleanedText.substring(0, 500));
  console.log('=== ENHANCED PDF PARSING END ===');
  
  const result = analyzeResumeText(cleanedText, file.name);
  result.meta = {
    extractor: bestResult.method,
    usedOCR: bestResult.usedOCR || false,
    pages: bestResult.pages || 0,
    textLength: cleanedText.length,
    extractionScore: bestScore
  };
  
  return result;
};

// Score extracted text quality (higher = better)
const scoreExtractedText = (text) => {
  if (!text || typeof text !== 'string') return 0;
  
  let score = text.length * 0.1; // Base score from length
  
  // Bonus for common resume keywords
  const resumeKeywords = ['experience', 'education', 'skills', 'work', 'job', 'company', 'university', 'degree'];
  resumeKeywords.forEach(keyword => {
    if (text.toLowerCase().includes(keyword)) score += 10;
  });
  
  // Bonus for proper formatting
  if (text.includes('\n')) score += 5; // Has line breaks
  if (/\d{4}/.test(text)) score += 10; // Has years
  if (/@/.test(text)) score += 5; // Has email
  if (/\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(text)) score += 10; // Has proper names
  
  // Penalty for too much gibberish
  const gibberishRatio = (text.match(/[^a-zA-Z0-9\s.,;:!?()-]/g) || []).length / text.length;
  if (gibberishRatio > 0.1) score -= gibberishRatio * 100;
  
  return Math.max(0, score);
};

// Method 1: Standard PDF.js extraction (fast and simple)
const extractWithPdfJsStandard = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer, 
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true
  }).promise;
  
  let fullText = '';
  const maxPages = Math.min(pdf.numPages, 10); // Limit pages for speed
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter(item => item.str && item.str.trim())
      .map(item => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }
  
  return { text: fullText, pages: pdf.numPages };
};

// Method 2: Robust PDF.js extraction with position-based text ordering (slower but better structure)
const extractWithPdfJsRobust = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer, 
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true
  }).promise;
  
  let allLines = [];
  const maxPages = Math.min(pdf.numPages, 5); // Limit for performance
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items by their Y coordinate to preserve line structure
    const lineMap = new Map();
    
    textContent.items.forEach(item => {
      if (!item.str || !item.str.trim()) return;
      
      const y = Math.round(item.transform[5]);
      const x = item.transform[4];
      
      if (!lineMap.has(y)) {
        lineMap.set(y, []);
      }
      
      lineMap.get(y).push({ x, text: item.str });
    });
    
    // Sort lines by Y coordinate (top to bottom) and text by X coordinate (left to right)
    const sortedYs = Array.from(lineMap.keys()).sort((a, b) => b - a);
    
    sortedYs.forEach(y => {
      const lineItems = lineMap.get(y).sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(item => item.text).join(' ').trim();
      if (lineText && lineText.length > 1) {
        allLines.push(lineText);
      }
    });
    
    if (pageNum < maxPages) allLines.push(''); // Add page break
  }
  
  return { text: allLines.join('\n'), pages: pdf.numPages };
};

// Method 3: Raw PDF.js extraction with minimal processing (fastest)
const extractWithPdfJsRaw = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer, 
    useWorker: false,
    verbosity: 0,
    disableAutoFetch: true,
    disableStream: true
  }).promise;
  
  let rawText = '';
  const maxPages = Math.min(pdf.numPages, 3); // Very limited for speed
  
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Extract all text with minimal processing
    const pageText = textContent.items
      .filter(item => item.str && item.str.trim().length > 0)
      .map(item => item.str)
      .join(' ');
    
    if (pageText.trim()) {
      rawText += pageText + '\n\n';
    }
  }
  
  return { text: rawText, pages: pdf.numPages };
};

// Enhanced OCR extraction using Tesseract.js
const extractWithTesseractOCR = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer, 
    useWorker: false,
    verbosity: 0 
  }).promise;
  
  const { createWorker } = await import('tesseract.js');
  const worker = await createWorker('eng');
  
  let ocrText = '';
  
  try {
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render page to canvas
      await page.render({ canvasContext: context, viewport }).promise;
      
      // Convert canvas to image and run OCR
      const imageData = canvas.toDataURL('image/png');
      const { data: { text } } = await worker.recognize(imageData);
      
      ocrText += text + '\n\n';
    }
  } finally {
    await worker.terminate();
  }
  
  return { text: ocrText, pages: pdf.numPages };
};


// Extract text from DOCX using Mammoth
const extractTextFromDocx = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  // Try mammoth first with dynamic import to avoid bundling issues
  try {
    const { default: mammoth } = await import('mammoth');
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    const text = cleanDocxText(value);
    console.log('=== DOCX PARSING DEBUG (Mammoth) ===');
    console.log('File name:', file.name);
    console.log('Extracted text (first 500 chars):', text.substring(0, 500));
    console.log('Text length:', text.length);
    const result = analyzeResumeText(text, file.name);
    result.meta = { extractor: 'mammoth' };
    console.log('Parsed result:', result);
    console.log('=== END DOCX DEBUG ===');
    return result;
  } catch (mammothError) {
    console.warn('Mammoth failed, attempting JSZip fallback...', mammothError);
    try {
      const result = await fallbackExtractDocxWithZip(arrayBuffer, file.name);
      return result;
    } catch (zipError) {
      console.error('DOCX JSZip fallback failed:', zipError);
      return createFallbackResumeData(file.name, String(mammothError?.message || mammothError));
    }
  }
};

// Fallback: use JSZip to extract word/document.xml and convert to text
const fallbackExtractDocxWithZip = async (arrayBuffer, fileName) => {
  const { default: JSZip } = await import('jszip');
  const zip = await JSZip.loadAsync(arrayBuffer);
  // Standard DOCX main document path
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    throw new Error('document.xml not found in DOCX');
  }
  const xml = await docFile.async('string');
  // Convert common DOCX XML to text: paragraphs <w:p>, runs <w:t>
  let text = xml
    .replace(/<w:tab\b[^>]*\/>/g, '\t')
    .replace(/<w:br\b[^>]*\/>/g, '\n')
    .replace(/<w:p\b[^>]*>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:t[^>]*>/g, '')
    .replace(/<\/w:t>/g, '')
    .replace(/<[^>]+>/g, '');
  // Decode XML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  text = cleanDocxText(text);
  console.log('=== DOCX PARSING DEBUG (JSZip Fallback) ===');
  console.log('File name:', fileName);
  console.log('Extracted text (first 500 chars):', text.substring(0, 500));
  console.log('Text length:', text.length);
  const result = analyzeResumeText(text, fileName);
  result.meta = { extractor: 'jszip' };
  console.log('Parsed result:', result);
  console.log('=== END DOCX ZIP DEBUG ===');
  return result;
};

// Create fallback resume data when file reading fails
const createFallbackResumeData = (fileName, parseErrorMessage) => {
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
    meta: { error: true }
  };
};
