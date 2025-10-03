// Comprehensive career path analysis with alternative recommendations
export const generateCareerPaths = (resumeData, psychometricResults) => {
  const { personalityType, traits } = psychometricResults;
  const { skills, experience, currentRole, education, industry } = resumeData;

  // Define comprehensive career paths with requirements and growth trajectories
  const careerPaths = {
    'Chief Technology Officer': {
      category: 'Executive Leadership',
      description: 'Lead technology strategy and innovation at the executive level',
      requirements: {
        experience: '10+ years',
        education: 'Bachelor\'s or higher',
        skills: ['leadership', 'strategy', 'technology', 'management'],
        traits: ['leadership', 'strategic', 'visionary', 'innovative']
      },
      growth: ['Senior Developer', 'Tech Lead', 'Engineering Manager', 'VP Engineering', 'CTO'],
      salary: '$200,000 - $500,000+',
      aiResistance: 95,
      industries: ['Technology', 'Finance', 'Healthcare', 'Manufacturing']
    },
    'Product Manager': {
      category: 'Product & Strategy',
      description: 'Drive product vision, strategy, and execution across organizations',
      requirements: {
        experience: '3+ years',
        education: 'Bachelor\'s preferred',
        skills: ['product management', 'strategy', 'analytics', 'communication'],
        traits: ['strategic', 'analytical', 'collaborative', 'innovative']
      },
      growth: ['Business Analyst', 'Associate PM', 'Product Manager', 'Senior PM', 'VP Product'],
      salary: '$90,000 - $200,000+',
      aiResistance: 85,
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce']
    },
    'Data Science Manager': {
      category: 'Data & Analytics Leadership',
      description: 'Lead data science teams and drive data-driven decision making',
      requirements: {
        experience: '5+ years',
        education: 'Master\'s preferred',
        skills: ['data science', 'machine learning', 'leadership', 'statistics'],
        traits: ['analytical', 'leadership', 'innovative', 'strategic']
      },
      growth: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Data Science Manager', 'Chief Data Officer'],
      salary: '$130,000 - $250,000+',
      aiResistance: 80,
      industries: ['Technology', 'Finance', 'Healthcare', 'Retail']
    },
    'Solution Architect': {
      category: 'Technical Architecture',
      description: 'Design and oversee complex technical solutions and system architecture',
      requirements: {
        experience: '7+ years',
        education: 'Bachelor\'s or higher',
        skills: ['architecture', 'system design', 'cloud', 'integration'],
        traits: ['analytical', 'strategic', 'detail_oriented', 'innovative']
      },
      growth: ['Developer', 'Senior Developer', 'Tech Lead', 'Solution Architect', 'Enterprise Architect'],
      salary: '$120,000 - $200,000+',
      aiResistance: 90,
      industries: ['Technology', 'Finance', 'Healthcare', 'Government']
    },
    'UX Research Director': {
      category: 'User Experience Leadership',
      description: 'Lead user experience research and design strategy across products',
      requirements: {
        experience: '6+ years',
        education: 'Bachelor\'s in Design/Psychology preferred',
        skills: ['ux research', 'design thinking', 'leadership', 'analytics'],
        traits: ['empathetic', 'analytical', 'creative', 'collaborative']
      },
      growth: ['UX Researcher', 'Senior UX Researcher', 'UX Research Manager', 'UX Research Director'],
      salary: '$110,000 - $180,000+',
      aiResistance: 92,
      industries: ['Technology', 'E-commerce', 'Healthcare', 'Education']
    },
    'DevOps Engineering Manager': {
      category: 'Infrastructure Leadership',
      description: 'Lead DevOps teams and drive infrastructure automation and reliability',
      requirements: {
        experience: '5+ years',
        education: 'Bachelor\'s preferred',
        skills: ['devops', 'cloud', 'automation', 'leadership'],
        traits: ['organized', 'analytical', 'leadership', 'practical']
      },
      growth: ['DevOps Engineer', 'Senior DevOps Engineer', 'DevOps Lead', 'DevOps Manager', 'VP Engineering'],
      salary: '$120,000 - $200,000+',
      aiResistance: 85,
      industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce']
    },
    'Cybersecurity Director': {
      category: 'Security Leadership',
      description: 'Lead cybersecurity strategy and protect organizational digital assets',
      requirements: {
        experience: '7+ years',
        education: 'Bachelor\'s in Security/IT',
        skills: ['cybersecurity', 'risk management', 'compliance', 'leadership'],
        traits: ['analytical', 'cautious', 'detail_oriented', 'strategic']
      },
      growth: ['Security Analyst', 'Security Engineer', 'Security Manager', 'Security Director', 'CISO'],
      salary: '$130,000 - $250,000+',
      aiResistance: 95,
      industries: ['Technology', 'Finance', 'Healthcare', 'Government']
    },
    'Innovation Consultant': {
      category: 'Strategy & Innovation',
      description: 'Help organizations drive innovation and digital transformation',
      requirements: {
        experience: '5+ years',
        education: 'Master\'s preferred',
        skills: ['consulting', 'innovation', 'strategy', 'change management'],
        traits: ['innovative', 'strategic', 'charismatic', 'adaptable']
      },
      growth: ['Business Analyst', 'Consultant', 'Senior Consultant', 'Innovation Consultant', 'Partner'],
      salary: '$100,000 - $200,000+',
      aiResistance: 88,
      industries: ['Consulting', 'Technology', 'Finance', 'Healthcare']
    },
    'Technical Writer Manager': {
      category: 'Technical Communication',
      description: 'Lead technical documentation strategy and content creation teams',
      requirements: {
        experience: '4+ years',
        education: 'Bachelor\'s in English/Communications',
        skills: ['technical writing', 'content strategy', 'leadership', 'communication'],
        traits: ['detail_oriented', 'organized', 'empathetic', 'collaborative']
      },
      growth: ['Technical Writer', 'Senior Technical Writer', 'Documentation Lead', 'Technical Writer Manager'],
      salary: '$80,000 - $140,000+',
      aiResistance: 75,
      industries: ['Technology', 'Healthcare', 'Manufacturing', 'Education']
    },
    'Startup Founder': {
      category: 'Entrepreneurship',
      description: 'Create and lead innovative startups to solve market problems',
      requirements: {
        experience: '3+ years',
        education: 'Any',
        skills: ['entrepreneurship', 'leadership', 'strategy', 'fundraising'],
        traits: ['entrepreneurial', 'risk_taking', 'visionary', 'resilient']
      },
      growth: ['Employee', 'Team Lead', 'Co-founder', 'Founder', 'Serial Entrepreneur'],
      salary: '$0 - $1,000,000+ (highly variable)',
      aiResistance: 98,
      industries: ['Any', 'Technology', 'Healthcare', 'Fintech']
    }
  };

  // Calculate match scores for each career path
  const calculateMatch = (path) => {
    let score = 0;
    let maxScore = 0;

    // Experience match (25% weight)
    const expWeight = 25;
    maxScore += expWeight;
    const expYears = parseInt(experience.replace(/\D/g, '')) || 0;
    const requiredExp = parseInt(path.requirements.experience.replace(/\D/g, '')) || 0;
    if (expYears >= requiredExp) score += expWeight;
    else if (expYears >= requiredExp * 0.7) score += expWeight * 0.7;
    else if (expYears >= requiredExp * 0.5) score += expWeight * 0.4;

    // Skills match (30% weight)
    const skillsWeight = 30;
    maxScore += skillsWeight;
    const userSkills = skills.map(s => s.toLowerCase());
    const requiredSkills = path.requirements.skills;
    const skillMatches = requiredSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
      )
    ).length;
    score += (skillMatches / requiredSkills.length) * skillsWeight;

    // Personality traits match (35% weight)
    const traitsWeight = 35;
    maxScore += traitsWeight;
    const userTraits = traits.allTraits || [];
    const requiredTraits = path.requirements.traits;
    let traitScore = 0;
    requiredTraits.forEach(requiredTrait => {
      const userTrait = userTraits.find(t => 
        t.trait.toLowerCase().replace(/\s+/g, '_') === requiredTrait.toLowerCase()
      );
      if (userTrait) {
        traitScore += (userTrait.score / 100) * (traitsWeight / requiredTraits.length);
      }
    });
    score += traitScore;

    // Industry match (10% weight)
    const industryWeight = 10;
    maxScore += industryWeight;
    if (path.industries.includes(industry)) {
      score += industryWeight;
    } else if (path.industries.includes('Any')) {
      score += industryWeight * 0.8;
    }

    return Math.round((score / maxScore) * 100);
  };

  // Generate recommendations
  const recommendations = Object.entries(careerPaths)
    .map(([title, path]) => ({
      title,
      ...path,
      matchScore: calculateMatch(path),
      reasoning: generateReasoning(path, resumeData, psychometricResults)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);

  // Categorize recommendations
  const primaryPath = recommendations[0];
  const alternativePaths = recommendations.slice(1, 4);
  const emergingPaths = recommendations.slice(4, 7);

  return {
    primaryRecommendation: primaryPath,
    alternativeCareerPaths: alternativePaths,
    emergingOpportunities: emergingPaths,
    allRecommendations: recommendations
  };
};

const generateReasoning = (path, resumeData, psychometricResults) => {
  const reasons = [];
  
  // Experience reasoning
  const expYears = parseInt(resumeData.experience.replace(/\D/g, '')) || 0;
  const requiredExp = parseInt(path.requirements.experience.replace(/\D/g, '')) || 0;
  if (expYears >= requiredExp) {
    reasons.push(`Your ${resumeData.experience} of experience meets the requirements`);
  } else {
    reasons.push(`You're ${requiredExp - expYears} years away from typical experience requirements`);
  }

  // Skills reasoning
  const userSkills = resumeData.skills.map(s => s.toLowerCase());
  const matchingSkills = path.requirements.skills.filter(skill => 
    userSkills.some(userSkill => 
      userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
    )
  );
  if (matchingSkills.length > 0) {
    reasons.push(`Your skills in ${matchingSkills.join(', ')} align well with this role`);
  }

  // Personality reasoning
  const topTraits = psychometricResults.traits.dominantTraits?.slice(0, 2) || [];
  const matchingTraits = topTraits.filter(trait => 
    path.requirements.traits.some(reqTrait => 
      trait.trait.toLowerCase().replace(/\s+/g, '_') === reqTrait.toLowerCase()
    )
  );
  if (matchingTraits.length > 0) {
    reasons.push(`Your ${matchingTraits.map(t => t.trait).join(' and ')} personality traits are ideal for this role`);
  }

  // AI resistance reasoning
  if (path.aiResistance >= 90) {
    reasons.push('This role is highly resistant to AI automation');
  } else if (path.aiResistance >= 80) {
    reasons.push('This role has good protection against AI disruption');
  }

  return reasons.slice(0, 3); // Return top 3 reasons
};

// Generate detailed development plan
export const generateDevelopmentPlan = (targetPath, currentProfile) => {
  const plan = {
    immediate: [], // 0-6 months
    shortTerm: [], // 6-18 months  
    longTerm: [] // 18+ months
  };

  // Skill gaps analysis
  const currentSkills = currentProfile.skills.map(s => s.toLowerCase());
  const requiredSkills = targetPath.requirements.skills;
  const missingSkills = requiredSkills.filter(skill => 
    !currentSkills.some(current => 
      current.includes(skill.toLowerCase()) || skill.toLowerCase().includes(current)
    )
  );

  // Experience gaps
  const currentExp = parseInt(currentProfile.experience.replace(/\D/g, '')) || 0;
  const requiredExp = parseInt(targetPath.requirements.experience.replace(/\D/g, '')) || 0;
  const expGap = Math.max(0, requiredExp - currentExp);

  // Generate recommendations
  if (missingSkills.length > 0) {
    plan.immediate.push(`Develop skills in: ${missingSkills.slice(0, 2).join(', ')}`);
    if (missingSkills.length > 2) {
      plan.shortTerm.push(`Advanced training in: ${missingSkills.slice(2).join(', ')}`);
    }
  }

  if (expGap > 0) {
    if (expGap <= 2) {
      plan.shortTerm.push('Seek stretch assignments and increased responsibilities');
    } else {
      plan.longTerm.push(`Gain ${expGap} years of relevant experience through progressive roles`);
    }
  }

  // Education recommendations
  if (targetPath.requirements.education.includes('Master') && 
      !currentProfile.education.includes('Masters') && 
      !currentProfile.education.includes('PhD')) {
    plan.longTerm.push('Consider pursuing a Master\'s degree or equivalent certification');
  }

  return plan;
};
