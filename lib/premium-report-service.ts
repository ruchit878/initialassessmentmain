// Premium report generation service
import { MarketDataService, AIInsightsService } from "./market-data-service"
import { generateCareerPaths } from "./career-path-analysis"

export class PremiumReportService {
  static async generatePremiumReport(resumeData: any, psychometricResults: any, analysisType: string) {
    const [salaryBenchmarks, industryTrends, skillsMarketValue, marketIntelligence, careerAnalysis] = await Promise.all(
      [
        MarketDataService.getSalaryBenchmarks(resumeData.currentRole),
        MarketDataService.getIndustryTrends(resumeData.industry),
        MarketDataService.getSkillsMarketValue(resumeData.skills),
        MarketDataService.getMarketIntelligence(),
        Promise.resolve(generateCareerPaths(resumeData, psychometricResults)),
      ],
    )

    const aiStrategies = AIInsightsService.generateCareerStrategy()
    const riskAnalysis = AIInsightsService.generateRiskAnalysis()

    const careerPaths = [careerAnalysis.primaryRecommendation, ...careerAnalysis.alternativeCareerPaths].map(
      (path) => ({
        ...path,
        skills: path.requirements?.skills || [],
        nextSteps: path.reasoning || [],
        growthPotential: "High",
        salaryRange: path.salary || "Competitive",
        aiProofReason: `This role has ${path.aiResistance}% resistance to AI automation`,
        score: path.matchScore || 85,
      }),
    )

    return {
      executiveSummary: {
        overview: `Based on comprehensive market analysis, you are well-positioned for ${resumeData.currentRole} advancement`,
        keyFindings: [
          `Your skills command a ${salaryBenchmarks.growth} premium in the current market`,
          `${industryTrends.hotSkills.length} of your skills are in high demand`,
          `Career advancement potential: Strong`,
          `Recommended salary range: $${salaryBenchmarks.percentiles.p75.toLocaleString()} - $${salaryBenchmarks.percentiles.p90.toLocaleString()}`,
        ],
      },
      marketPosition: {
        currentValue: {
          currentEstimate: salaryBenchmarks.percentiles.p50,
          improvementPotential: "25-40%",
        },
        salaryBenchmarks,
        negotiationInsights: marketIntelligence.negotiationInsights,
      },
      skillsIntelligence: {
        currentSkills: skillsMarketValue,
        skillGaps: [
          { skill: "Kubernetes", priority: "High", salaryImpact: "+25%", timeToAcquire: "3-6 months" },
          { skill: "Machine Learning", priority: "High", salaryImpact: "+28%", timeToAcquire: "6-12 months" },
        ],
        skillsROI: skillsMarketValue.slice(0, 3).map((skill) => ({
          skill: skill.skill,
          currentValue: skill.avgSalaryBoost,
          investmentCost: "$3,000",
          roi: "650%",
          paybackPeriod: "6 months",
        })),
      },
      careerStrategy: {
        aiStrategies,
        timelineRoadmap: {
          "0-3 months": [
            "Update LinkedIn with target keywords",
            "Begin AWS certification",
            "Network with 10 industry leaders",
          ],
          "3-6 months": ["Complete certification", "Build portfolio project", "Apply to target roles"],
          "6-12 months": ["Secure new role", "Establish leadership", "Plan advancement"],
        },
      },
      riskAssessment: riskAnalysis,
      careerPaths,
      personalityAnalysis:
        analysisType === "detailed"
          ? {
              profile: psychometricResults.personalityProfile,
            }
          : null,
      aiProofSkills: [
        { skill: "Creative Problem Solving", strength: 90 },
        { skill: "Strategic Thinking", strength: 95 },
        { skill: "Leadership & Communication", strength: 92 },
        { skill: "Emotional Intelligence", strength: 88 },
        { skill: "Complex Decision Making", strength: 94 },
      ],
      recommendations: [
        `Focus on developing leadership skills`,
        `Leverage your experience in ${resumeData.industry}`,
        `Consider certifications relevant to your field`,
        `Build a portfolio showcasing your expertise`,
      ],
      nextSteps: [
        "Complete relevant certifications in your chosen path",
        "Build a portfolio showcasing your strategic thinking",
        "Seek mentorship from leaders in your target role",
        "Network with professionals in your desired field",
      ],
    }
  }
}
