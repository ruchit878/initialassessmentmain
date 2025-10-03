// Comprehensive career path analysis with alternative recommendations

interface ResumeData {
  skills: string[]
  experience: string
  currentRole: string
  education: string
  industry: string
}

interface PsychometricResults {
  personalityType: string
  personalityProfile?: {
    type: string
    description: string
    dominantTraits?: Array<{ trait: string; score: number }>
    allTraits?: Array<{ trait: string; score: number }>
  }
  traits?: {
    dominantTraits?: Array<{ trait: string; score: number }>
    allTraits?: Array<{ trait: string; score: number }>
  }
}

interface CareerPath {
  category: string
  description: string
  requirements: {
    experience: string
    education: string
    skills: string[]
    traits: string[]
  }
  growth: string[]
  salary: string
  aiResistance: number
  industries: string[]
}

export const generateCareerPaths = (resumeData: ResumeData, psychometricResults: PsychometricResults) => {
  const careerPaths: Record<string, CareerPath> = {
    "Chief Technology Officer": {
      category: "Executive Leadership",
      description: "Lead technology strategy and innovation at the executive level",
      requirements: {
        experience: "10+ years",
        education: "Bachelor's or higher",
        skills: ["leadership", "strategy", "technology", "management"],
        traits: ["leadership", "strategic", "visionary", "innovative"],
      },
      growth: ["Senior Developer", "Tech Lead", "Engineering Manager", "VP Engineering", "CTO"],
      salary: "$200,000 - $500,000+",
      aiResistance: 95,
      industries: ["Technology", "Finance", "Healthcare", "Manufacturing"],
    },
    "Product Manager": {
      category: "Product & Strategy",
      description: "Drive product vision, strategy, and execution across organizations",
      requirements: {
        experience: "3+ years",
        education: "Bachelor's preferred",
        skills: ["product management", "strategy", "analytics", "communication"],
        traits: ["strategic", "analytical", "collaborative", "innovative"],
      },
      growth: ["Business Analyst", "Associate PM", "Product Manager", "Senior PM", "VP Product"],
      salary: "$90,000 - $200,000+",
      aiResistance: 85,
      industries: ["Technology", "Finance", "Healthcare", "E-commerce"],
    },
    "Solution Architect": {
      category: "Technical Architecture",
      description: "Design and oversee complex technical solutions and system architecture",
      requirements: {
        experience: "7+ years",
        education: "Bachelor's or higher",
        skills: ["architecture", "system design", "cloud", "integration"],
        traits: ["analytical", "strategic", "detail_oriented", "innovative"],
      },
      growth: ["Developer", "Senior Developer", "Tech Lead", "Solution Architect", "Enterprise Architect"],
      salary: "$120,000 - $200,000+",
      aiResistance: 90,
      industries: ["Technology", "Finance", "Healthcare", "Government"],
    },
    "AI/ML Solutions Architect": {
      category: "AI & Machine Learning",
      description: "Design and implement AI/ML systems that require human oversight and strategic thinking",
      requirements: {
        experience: "5+ years",
        education: "Master's preferred",
        skills: ["machine learning", "system architecture", "strategic planning", "team leadership"],
        traits: ["analytical", "innovative", "strategic", "detail_oriented"],
      },
      growth: ["ML Engineer", "Senior ML Engineer", "ML Architect", "AI Solutions Architect", "Chief AI Officer"],
      salary: "$140,000 - $220,000+",
      aiResistance: 92,
      industries: ["Technology", "Finance", "Healthcare", "Automotive"],
    },
    "DevOps Engineering Manager": {
      category: "Infrastructure Leadership",
      description: "Lead DevOps teams and drive infrastructure automation and reliability",
      requirements: {
        experience: "5+ years",
        education: "Bachelor's preferred",
        skills: ["devops", "cloud", "automation", "leadership"],
        traits: ["organized", "analytical", "leadership", "practical"],
      },
      growth: ["DevOps Engineer", "Senior DevOps Engineer", "DevOps Lead", "DevOps Manager", "VP Engineering"],
      salary: "$120,000 - $200,000+",
      aiResistance: 85,
      industries: ["Technology", "Finance", "Healthcare", "E-commerce"],
    },
  }

  const calculateMatch = (path: CareerPath) => {
    let score = 0
    let maxScore = 0

    // Experience match (25% weight)
    const expWeight = 25
    maxScore += expWeight
    const expYears = Number.parseInt(resumeData.experience.replace(/\D/g, "")) || 0
    const requiredExp = Number.parseInt(path.requirements.experience.replace(/\D/g, "")) || 0
    if (expYears >= requiredExp) score += expWeight
    else if (expYears >= requiredExp * 0.7) score += expWeight * 0.7
    else if (expYears >= requiredExp * 0.5) score += expWeight * 0.4

    // Skills match (30% weight)
    const skillsWeight = 30
    maxScore += skillsWeight
    const userSkills = resumeData.skills.map((s) => s.toLowerCase())
    const requiredSkills = path.requirements.skills
    const skillMatches = requiredSkills.filter((skill) =>
      userSkills.some(
        (userSkill) => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill),
      ),
    ).length
    score += (skillMatches / requiredSkills.length) * skillsWeight

    // Personality traits match (35% weight)
    const traitsWeight = 35
    maxScore += traitsWeight
    const userTraits = psychometricResults.traits?.allTraits || psychometricResults.personalityProfile?.allTraits || []
    const requiredTraits = path.requirements.traits
    let traitScore = 0
    for (const requiredTrait of requiredTraits) {
      const userTrait = userTraits.find(
        (t) => t.trait.toLowerCase().replace(/\s+/g, "_") === requiredTrait.toLowerCase(),
      )
      if (userTrait) {
        traitScore += (userTrait.score / 100) * (traitsWeight / requiredTraits.length)
      }
    }
    score += traitScore

    // Industry match (10% weight)
    const industryWeight = 10
    maxScore += industryWeight
    if (path.industries.includes(resumeData.industry)) {
      score += industryWeight
    } else if (path.industries.includes("Any")) {
      score += industryWeight * 0.8
    }

    return Math.round((score / maxScore) * 100)
  }

  const generateReasoning = (path: CareerPath) => {
    const reasons: string[] = []

    const expYears = Number.parseInt(resumeData.experience.replace(/\D/g, "")) || 0
    const requiredExp = Number.parseInt(path.requirements.experience.replace(/\D/g, "")) || 0
    if (expYears >= requiredExp) {
      reasons.push(`Your ${resumeData.experience} of experience meets the requirements`)
    } else {
      reasons.push(`You're ${requiredExp - expYears} years away from typical experience requirements`)
    }

    const userSkills = resumeData.skills.map((s) => s.toLowerCase())
    const matchingSkills = path.requirements.skills.filter((skill) =>
      userSkills.some(
        (userSkill) => userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill),
      ),
    )
    if (matchingSkills.length > 0) {
      reasons.push(`Your skills in ${matchingSkills.join(", ")} align well with this role`)
    }

    if (path.aiResistance >= 90) {
      reasons.push("This role is highly resistant to AI automation")
    } else if (path.aiResistance >= 80) {
      reasons.push("This role has good protection against AI disruption")
    }

    return reasons.slice(0, 3)
  }

  const recommendations = Object.entries(careerPaths)
    .map(([title, path]) => ({
      title,
      ...path,
      matchScore: calculateMatch(path),
      reasoning: generateReasoning(path),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)

  return {
    primaryRecommendation: recommendations[0],
    alternativeCareerPaths: recommendations.slice(1, 4),
    emergingOpportunities: recommendations.slice(4, 7),
    allRecommendations: recommendations,
  }
}
