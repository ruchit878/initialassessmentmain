// Market data service for salary benchmarks and industry trends

export class MarketDataService {
  static async getSalaryBenchmarks(role: string) {
    const salaryData: Record<string, any> = {
      "Software Architect": {
        percentiles: { p25: 155000, p50: 180000, p75: 210000, p90: 250000 },
        growth: "+8.5%",
        demand: "Very High",
        companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
      },
      "Solution Architect": {
        percentiles: { p25: 155000, p50: 180000, p75: 210000, p90: 250000 },
        growth: "+8.5%",
        demand: "Very High",
        companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple"],
      },
      "AI/ML Engineer": {
        percentiles: { p25: 140000, p50: 165000, p75: 195000, p90: 235000 },
        growth: "+12.2%",
        demand: "Very High",
        companies: ["OpenAI", "Google", "Meta", "Microsoft", "Amazon"],
      },
    }

    return (
      salaryData[role] || {
        percentiles: { p25: 95000, p50: 110000, p75: 130000, p90: 155000 },
        growth: "+5.5%",
        demand: "Moderate",
        companies: ["Various Tech Companies"],
      }
    )
  }

  static async getIndustryTrends(industry: string) {
    const trends: Record<string, any> = {
      Technology: {
        growth: "+12.4%",
        outlook: "Excellent",
        hotSkills: ["AI/ML", "Cloud Architecture", "DevOps", "Cybersecurity", "Data Engineering"],
        emergingRoles: ["AI Engineer", "MLOps Engineer", "Cloud Architect", "DevSecOps Engineer"],
        threats: ["AI Automation", "Economic Uncertainty"],
        opportunities: ["Digital Transformation", "AI Adoption", "Cloud Migration"],
      },
      Finance: {
        growth: "+6.8%",
        outlook: "Good",
        hotSkills: ["FinTech", "Blockchain", "Risk Management", "Regulatory Compliance"],
        emergingRoles: ["Blockchain Developer", "FinTech Product Manager", "Risk Analyst"],
        threats: ["Regulatory Changes", "Market Volatility"],
        opportunities: ["Digital Banking", "Cryptocurrency", "RegTech"],
      },
    }

    return trends[industry] || trends.Technology
  }

  static async getSkillsMarketValue(skills: string[]) {
    const skillValues: Record<string, any> = {
      JavaScript: { demand: "Very High", growth: "+8.5%", avgSalaryBoost: "+15%", jobs: 45000 },
      Python: { demand: "Very High", growth: "+12.2%", avgSalaryBoost: "+18%", jobs: 52000 },
      React: { demand: "High", growth: "+10.1%", avgSalaryBoost: "+12%", jobs: 28000 },
      AWS: { demand: "Very High", growth: "+15.8%", avgSalaryBoost: "+22%", jobs: 38000 },
      Kubernetes: { demand: "Very High", growth: "+25.2%", avgSalaryBoost: "+25%", jobs: 18000 },
      "Machine Learning": { demand: "Very High", growth: "+22.8%", avgSalaryBoost: "+28%", jobs: 35000 },
    }

    return skills.map((skill) => ({
      skill,
      ...(skillValues[skill] || {
        demand: "Moderate",
        growth: "+5.0%",
        avgSalaryBoost: "+8%",
        jobs: 5000,
      }),
    }))
  }

  static async getMarketIntelligence() {
    return {
      negotiationInsights: {
        salaryNegotiationRoom: "15-25%",
        keyLeveragePoints: ["Specialized skills", "Industry experience", "Multiple offers"],
        bestTimeToNegotiate: "After demonstrating value in first 90 days",
      },
    }
  }
}

export class AIInsightsService {
  static generateCareerStrategy() {
    return [
      {
        strategy: "Skill Arbitrage Opportunity",
        impact: "High",
        timeframe: "3-6 months",
        description: "Your skills are undervalued in current market",
      },
      {
        strategy: "Leadership Transition Path",
        impact: "Very High",
        timeframe: "6-12 months",
        description: "Technical depth positions you for leadership",
      },
      {
        strategy: "Specialization Premium",
        impact: "High",
        timeframe: "12-18 months",
        description: "Deep AI/ML expertise commands premium",
      },
    ]
  }

  static generateRiskAnalysis() {
    return {
      automationRisk: {
        level: "Low",
        score: 15,
        reasoning: "Your role requires strategic thinking, creativity, and human judgment",
      },
    }
  }
}
