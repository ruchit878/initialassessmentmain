import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, TrendingUp, Shield, Brain, Star, ArrowLeft, CheckCircle, DollarSign, Target, Zap, Users, BookOpen, AlertTriangle, Trophy, Briefcase, Clock, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import { generateCareerPaths } from '../utils/careerPathAnalysis';
import { PremiumReportService } from '../services/premiumReportService';

const ReportGeneration = ({ resumeData, analysisType, psychometricResults }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (!resumeData) {
      navigate('/upload');
      return;
    }

    // Generate premium report with real-time market data
    const generateReport = async () => {
      try {
        const premiumReport = await PremiumReportService.generatePremiumReport(
          resumeData, 
          psychometricResults, 
          analysisType
        );
        setReportData(premiumReport);
        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating premium report:', error);
        // Fallback to basic report
        const fallbackReport = analysisType === 'detailed' 
          ? generateDetailedReport(resumeData, psychometricResults, generateCareerPaths(resumeData, psychometricResults))
          : generateQuickReport(resumeData);
        setReportData(fallbackReport);
        setIsGenerating(false);
      }
    };

    setTimeout(generateReport, 3000);
  }, [resumeData, analysisType, psychometricResults, navigate]);

  const generateDetailedReport = (resumeData, psychometricResults, careerAnalysis) => {
    const careerPaths = [
      careerAnalysis.primaryRecommendation,
      ...careerAnalysis.alternativeCareerPaths
    ].map(path => ({
      ...path,
      // Ensure all required fields exist
      skills: path.requirements?.skills || [],
      nextSteps: path.reasoning || [],
      growthPotential: "High",
      salaryRange: path.salary || "Competitive",
      aiProofReason: `This role has ${path.aiResistance}% resistance to AI automation`,
      score: path.matchScore || 85
    }));

    return {
      summary: {
        name: resumeData.fileName.replace(/\.[^/.]+$/, ""),
        currentRole: resumeData.currentRole,
        experience: resumeData.experience,
        industry: resumeData.industry,
        analysisType: 'detailed',
        personalityType: psychometricResults.personalityType, // This is now a string
        personalityDescription: psychometricResults.personalityProfile?.description,
        topSkills: resumeData.skills.slice(0, 5)
      },
      careerPaths: careerPaths,
      alternativePaths: careerAnalysis.emergingOpportunities || [],
      personalityInsights: psychometricResults.personalityProfile,
      recommendations: generateRecommendations(careerAnalysis.primaryRecommendation, resumeData),
      aiProofSkills: generateAIProofSkills(resumeData.skills),
      nextSteps: generateNextSteps(careerAnalysis.primaryRecommendation)
    };
  };

  const generateQuickReport = (resumeData) => {
    // Simplified report for quick analysis
    const mockCareerPaths = [
      {
        title: "Senior " + resumeData.currentRole,
        score: 85,
        description: "Natural progression in your current field",
        salaryRange: "$120K - $180K",
        growthPotential: "High",
        aiProofReason: "This role combines technical expertise with human judgment",
        skills: resumeData.skills.slice(0, 4),
        nextSteps: [
          "Seek senior-level responsibilities",
          "Mentor junior team members",
          "Lead strategic initiatives"
        ]
      },
      {
        title: "Technical Lead",
        score: 78,
        description: "Leadership role leveraging your technical expertise",
        salaryRange: "$130K - $200K",
        growthPotential: "Very High",
        aiProofReason: "Leadership and strategic thinking are uniquely human skills",
        skills: ["Leadership", "Strategy", "Technical Architecture", "Team Management"],
        nextSteps: [
          "Develop leadership skills",
          "Build cross-functional relationships",
          "Focus on strategic thinking"
        ]
      }
    ];

    return {
      summary: {
        name: resumeData.fileName.replace(/\.[^/.]+$/, ""),
        currentRole: resumeData.currentRole,
        experience: resumeData.experience,
        industry: resumeData.industry,
        analysisType: 'quick',
        personalityType: null,
        topSkills: resumeData.skills.slice(0, 5)
      },
      careerPaths: mockCareerPaths,
      alternativePaths: [],
      recommendations: generateRecommendations(mockCareerPaths[0], resumeData),
      aiProofSkills: generateAIProofSkills(resumeData.skills),
      nextSteps: generateNextSteps(mockCareerPaths[0])
    };
  };

  const generateRecommendations = (primaryPath, resumeData) => {
    return [
      `Focus on developing ${primaryPath?.title?.toLowerCase() || 'leadership'} skills`,
      `Leverage your experience in ${resumeData.industry}`,
      `Consider certifications relevant to ${primaryPath?.title || 'your field'}`,
      `Build a portfolio showcasing your ${resumeData.skills[0] || 'technical'} expertise`
    ];
  };

  const generateAIProofSkills = (skills) => {
    return skills.slice(0, 5).map((skill, index) => ({
      skill: skill,
      strength: Math.floor(Math.random() * 30) + 70 // 70-100%
    }));
  };

  const generateNextSteps = (primaryPath) => {
    return [
      `Research companies hiring for ${primaryPath?.title || 'your target role'}`,
      `Update your LinkedIn profile to highlight relevant experience`,
      `Network with professionals in your target industry`,
      `Consider additional training or certifications`
    ];
  };

  const generatePersonalityExplanation = (personalityInsights) => {
    const explanations = {
      'Strategic Leader': [
        'Your responses show strong leadership tendencies and strategic thinking capabilities',
        'You prefer to influence others through clear direction and vision-setting',
        'Your decision-making style combines data analysis with long-term strategic planning',
        'You thrive in environments where you can drive organizational success and innovation'
      ],
      'Analytical Thinker': [
        'Your assessment reveals a systematic approach to problem-solving and decision-making',
        'You consistently prefer data-driven analysis over intuitive decision-making',
        'Your attention to detail and methodical thinking style are key strengths',
        'You excel in environments that value precision, accuracy, and logical reasoning'
      ],
      'Creative Innovator': [
        'Your responses demonstrate a strong inclination toward innovation and creative problem-solving',
        'You embrace new ideas and technologies, often being an early adopter',
        'Your thinking style combines creativity with practical implementation',
        'You thrive in dynamic environments that encourage experimentation and boundary-pushing'
      ],
      'Collaborative Facilitator': [
        'Your assessment shows strong people-focused tendencies and collaborative instincts',
        'You prefer building consensus and involving others in decision-making processes',
        'Your empathetic nature and relationship-building skills are standout qualities',
        'You excel in team environments where cooperation and mutual support are valued'
      ],
      'Entrepreneurial Visionary': [
        'Your responses reveal high risk tolerance and entrepreneurial thinking patterns',
        'You demonstrate comfort with uncertainty and ability to see opportunities others miss',
        'Your visionary approach combines innovation with practical business acumen',
        'You thrive in environments that reward bold thinking and calculated risk-taking'
      ],
      'Subject Matter Expert': [
        'Your assessment shows deep focus on expertise development and knowledge mastery',
        'You prefer thorough research and comprehensive understanding before taking action',
        'Your studious nature and attention to detail make you a reliable knowledge source',
        'You excel in roles that value deep specialization and technical excellence'
      ],
      'Adaptive Professional': [
        'Your responses demonstrate exceptional flexibility and adaptability to change',
        'You show comfort with uncertainty and ability to pivot when circumstances shift',
        'Your versatile approach allows you to thrive in various environments and situations',
        'You excel in dynamic roles that require quick learning and situational adaptation'
      ],
      'Systematic Organizer': [
        'Your assessment reveals strong organizational skills and preference for structure',
        'You consistently choose systematic approaches over ad-hoc problem-solving methods',
        'Your disciplined nature and attention to process make you highly reliable',
        'You excel in environments that value efficiency, organization, and predictable outcomes'
      ],
      'Balanced Professional': [
        'Your responses show a well-rounded approach that draws from multiple thinking styles',
        'You demonstrate flexibility in adapting your approach based on situational needs',
        'Your balanced perspective allows you to see multiple sides of complex issues',
        'You excel in diverse environments that benefit from versatile, adaptable professionals'
      ]
    };

    return explanations[personalityInsights.type] || [
      'Your assessment reveals a unique combination of traits that make you well-suited for various roles',
      'Your balanced approach to problem-solving draws from multiple methodologies',
      'Your adaptability allows you to excel in different environments and situations',
      'Your diverse skill set makes you valuable in roles requiring versatile thinking'
    ];
  };

  const generateMockReport = (resume, type, psychometric) => {
    // Generate career paths based on actual resume data
    const isArchitect = resume.currentRole?.includes('Architect');
    const isSenior = resume.experience?.includes('20') || resume.experience?.includes('15') || resume.experience?.includes('10+');
    
    const baseCareerPaths = [
      {
        title: isArchitect ? "Chief Technology Officer" : "AI/ML Solutions Architect",
        score: isArchitect ? 95 : 92,
        description: isArchitect ? 
          "Lead technology strategy and innovation across the enterprise, leveraging your extensive architecture experience." :
          "Design and implement AI/ML systems that require human oversight and strategic thinking.",
        aiProofReason: isArchitect ?
          "Requires strategic vision, leadership, and deep technical expertise that only comes from years of hands-on experience." :
          "Requires creative problem-solving, strategic thinking, and human judgment in complex scenarios.",
        growthPotential: "Very High",
        salaryRange: isArchitect ? "$200K - $350K" : "$140K - $220K",
        skills: isArchitect ? 
          ["Strategic Leadership", "Enterprise Architecture", "Technology Vision", "Executive Communication"] :
          ["Machine Learning", "System Architecture", "Strategic Planning", "Team Leadership"],
        nextSteps: isArchitect ?
          ["Develop executive leadership skills", "Build board-level communication abilities", "Expand business strategy knowledge"] :
          ["Complete AWS ML certification", "Build portfolio of AI projects", "Develop business acumen"]
      },
      {
        title: isArchitect ? "VP of Engineering" : "Technical Product Manager",
        score: isArchitect ? 90 : 88,
        description: isArchitect ?
          "Scale engineering organizations and drive technical excellence across multiple teams and products." :
          "Bridge technical teams and business stakeholders to drive product innovation.",
        aiProofReason: isArchitect ?
          "Requires deep technical knowledge combined with organizational leadership and strategic business thinking." :
          "Combines technical knowledge with human empathy, communication, and strategic vision.",
        growthPotential: "Very High",
        salaryRange: isArchitect ? "$180K - $280K" : "$130K - $200K",
        skills: isArchitect ?
          ["Engineering Leadership", "Organizational Scaling", "Technical Strategy", "Talent Development"] :
          ["Product Strategy", "Technical Communication", "Stakeholder Management", "Data Analysis"],
        nextSteps: isArchitect ?
          ["Build large-scale team management experience", "Develop P&L responsibility", "Enhance strategic planning skills"] :
          ["Gain product management certification", "Develop business strategy skills", "Build cross-functional leadership experience"]
      },
      {
        title: isArchitect ? "Enterprise Technology Consultant" : "DevOps Engineering Lead",
        score: isArchitect ? 88 : 85,
        description: isArchitect ?
          "Provide strategic technology guidance to Fortune 500 companies undergoing digital transformation." :
          "Lead infrastructure automation while maintaining human oversight of complex systems.",
        aiProofReason: isArchitect ?
          "Leverages decades of experience to solve complex business problems that require human insight and relationship building." :
          "Requires creative problem-solving, crisis management, and team leadership skills.",
        growthPotential: isArchitect ? "Very High" : "High",
        salaryRange: isArchitect ? "$150K - $250K" : "$120K - $180K",
        skills: isArchitect ?
          ["Strategic Consulting", "Digital Transformation", "Executive Communication", "Change Management"] :
          ["Infrastructure as Code", "Team Leadership", "Crisis Management", "Strategic Planning"],
        nextSteps: isArchitect ?
          ["Build consulting methodology expertise", "Develop executive presence", "Expand industry knowledge"] :
          ["Master Kubernetes and cloud platforms", "Develop leadership skills", "Learn business operations"]
      }
    ];

    let additionalPaths = [];
    if (type === 'detailed' && psychometric) {
      additionalPaths = [
        {
          title: "Technology Consultant",
          score: 82,
          description: "Provide strategic technology guidance to organizations undergoing digital transformation.",
          aiProofReason: "Requires deep human understanding of business needs and change management.",
          growthPotential: "High",
          salaryRange: "$110K - $170K",
          skills: ["Business Analysis", "Change Management", "Client Relations", "Technology Strategy"],
          nextSteps: ["Develop consulting skills", "Build industry expertise", "Enhance presentation abilities"]
        },
        {
          title: "Engineering Manager",
          score: 79,
          description: "Lead technical teams while focusing on people development and strategic execution.",
          aiProofReason: "Combines technical expertise with human leadership and emotional intelligence.",
          growthPotential: "Very High",
          salaryRange: "$140K - $210K",
          skills: ["People Management", "Technical Leadership", "Strategic Planning", "Performance Coaching"],
          nextSteps: ["Develop management skills", "Build team leadership experience", "Learn business strategy"]
        }
      ];
    }

    return {
      summary: {
        name: resume.fileName?.replace(/\.(pdf|docx?|txt)$/i, '') || "Professional",
        currentRole: resume.currentRole,
        experience: resume.experience,
        industry: resume.industry,
        analysisType: type,
        personalityType: psychometric?.personalityType || null,
        topSkills: resume.skills.slice(0, 5)
      },
      careerPaths: [...baseCareerPaths, ...additionalPaths],
      aiProofSkills: [
        { skill: "Creative Problem Solving", strength: isSenior ? 90 : 75 },
        { skill: "Strategic Thinking", strength: isSenior ? 95 : 65 },
        { skill: "Leadership & Communication", strength: isSenior ? 92 : 70 },
        { skill: "Emotional Intelligence", strength: isSenior ? 88 : 68 },
        { skill: "Complex Decision Making", strength: isSenior ? 94 : 72 }
      ],
      recommendations: isArchitect ? [
        "Leverage your extensive architecture experience for executive roles",
        "Develop board-level communication and strategic planning skills",
        "Build expertise in emerging technologies and digital transformation",
        "Expand your network in C-suite and venture capital circles",
        "Consider advisory roles to build consulting experience"
      ] : [
        "Focus on developing leadership and communication skills",
        "Build expertise in AI/ML to stay ahead of automation trends",
        "Cultivate strategic thinking and business acumen",
        "Develop cross-functional collaboration abilities",
        "Invest in continuous learning and adaptability"
      ],
      nextSteps: [
        "Complete relevant certifications in your chosen path",
        "Build a portfolio showcasing your strategic thinking",
        "Seek mentorship from leaders in your target role",
        "Develop public speaking and presentation skills",
        "Network with professionals in your desired field"
      ]
    };
  };

  const downloadPDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    let yPosition = margin;

    // Title
    pdf.setFontSize(24);
    pdf.setFont(undefined, 'bold');
    pdf.text('ElephantScale Career Analysis Report', margin, yPosition);
    yPosition += 20;

    // Summary
    pdf.setFontSize(16);
    pdf.text('Executive Summary', margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Name: ${reportData.summary.name}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Current Role: ${reportData.summary.currentRole}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Experience: ${reportData.summary.experience}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Industry: ${reportData.summary.industry}`, margin, yPosition);
    yPosition += 15;

    // Career Paths
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Recommended Career Paths', margin, yPosition);
    yPosition += 15;

    reportData.careerPaths.forEach((path, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(`${index + 1}. ${path.title} (Score: ${path.score}/100)`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const descriptionLines = pdf.splitTextToSize(path.description, pageWidth - 2 * margin);
      pdf.text(descriptionLines, margin, yPosition);
      yPosition += descriptionLines.length * 5 + 5;

      pdf.text(`Salary Range: ${path.salaryRange}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Growth Potential: ${path.growthPotential}`, margin, yPosition);
      yPosition += 15;
    });

    pdf.save('ElephantScale-career-report.pdf');
  };

  if (!resumeData) {
    return null;
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <Brain className="w-16 h-16 text-primary-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Your Report</h2>
          <p className="text-gray-600 mb-6">
            Our AI is analyzing your profile and generating personalized career recommendations...
          </p>
          <div className="space-y-2 text-left text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Analyzing resume data
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              Processing market trends
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
              Generating career recommendations
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">ElephantScale</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={downloadPDF}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-6">
              <Trophy className="w-5 h-5 mr-2" />
              Premium Career Intelligence Report
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Career Analysis Report
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {reportData.executiveSummary?.overview || 'Comprehensive analysis of your career position and market opportunities'}
            </p>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Market Value</h3>
              <p className="text-2xl font-bold text-green-600">
                ${reportData.marketPosition?.currentValue?.currentEstimate?.toLocaleString() || '150,000'}
              </p>
              <p className="text-sm text-gray-600">Current Estimate</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Growth Potential</h3>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.marketPosition?.currentValue?.improvementPotential || '25-40%'}
              </p>
              <p className="text-sm text-gray-600">Salary Increase</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Market Position</h3>
              <p className="text-2xl font-bold text-purple-600">
                {reportData.executiveSummary?.keyFindings?.[2]?.split(': ')[1] || 'Strong'}
              </p>
              <p className="text-sm text-gray-600">Industry Ranking</p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">AI Resistance</h3>
              <p className="text-2xl font-bold text-orange-600">
                {100 - (reportData.riskAssessment?.automationRisk?.score || 15)}%
              </p>
              <p className="text-sm text-gray-600">Future-Proof Score</p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              Key Findings & Opportunities
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(reportData.executiveSummary?.keyFindings || [
                'Your skills are in high demand with strong growth potential',
                'Multiple career advancement opportunities available',
                'Strong market position with room for optimization',
                'Excellent timing for career advancement'
              ]).map((finding, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{finding}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Intelligence Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-4" />
            Market Intelligence & Salary Benchmarks
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Salary Benchmarks */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                Salary Benchmarks
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">25th Percentile</span>
                  <span className="font-bold text-gray-900">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p25?.toLocaleString() || '120,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">50th Percentile (Median)</span>
                  <span className="font-bold text-gray-900">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p50?.toLocaleString() || '150,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">75th Percentile</span>
                  <span className="font-bold text-green-600">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p75?.toLocaleString() || '180,000'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">90th Percentile</span>
                  <span className="font-bold text-green-700">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p90?.toLocaleString() || '220,000'}
                  </span>
                </div>
                <div className="pt-4 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">YoY Growth</span>
                    <span className="font-bold text-green-600">
                      {reportData.marketPosition?.salaryBenchmarks?.growth || '+8.5%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiation Intelligence */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 text-blue-600 mr-2" />
                Negotiation Intelligence
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Salary Negotiation Room</span>
                  <p className="font-bold text-blue-600 text-lg">
                    {reportData.marketPosition?.negotiationInsights?.salaryNegotiationRoom || '15-25%'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Key Leverage Points</span>
                  <ul className="mt-2 space-y-1">
                    {(reportData.marketPosition?.negotiationInsights?.keyLeveragePoints || [
                      'Specialized technical skills',
                      'Industry experience',
                      'Leadership potential'
                    ]).map((point, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-blue-200">
                  <span className="text-sm text-gray-600">Best Time to Negotiate</span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {reportData.marketPosition?.negotiationInsights?.bestTimeToNegotiate || 'After demonstrating value in first 90 days'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Paying Companies */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 text-purple-600 mr-2" />
              Top Paying Companies in Your Field
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(reportData.marketPosition?.salaryBenchmarks?.companies || [
                'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'
              ]).map((company, index) => (
                <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{company}</p>
                  <p className="text-xs text-gray-600">Hiring Now</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personality Analysis Section - Only for detailed reports */}
        {analysisType === 'detailed' && reportData.personalityAnalysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Brain className="w-6 h-6 text-primary-600 mr-3" />
              Your Personality Profile
            </h2>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{reportData.personalityAnalysis?.profile?.type || 'Balanced Professional'}</h3>
                  <p className="text-gray-600 mt-1">{reportData.personalityAnalysis?.profile?.description || 'A well-rounded professional with diverse strengths'}</p>
                </div>
              </div>
            </div>

            {/* Top 3 Dominant Traits */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Dominant Traits</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {(reportData.personalityAnalysis?.profile?.dominantTraits || []).slice(0, 3).map((trait, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-lg">{trait.score}%</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 mb-2">{trait.trait}</h5>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${trait.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personality Explanation */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Why You're a {reportData.personalityAnalysis?.profile?.type || 'Balanced Professional'}</h4>
              <div className="space-y-3 text-gray-700">
                {generatePersonalityExplanation(reportData.personalityAnalysis?.profile || { type: 'Balanced Professional' }).map((explanation, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{explanation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skills Intelligence Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <BookOpen className="w-8 h-8 text-purple-600 mr-4" />
            Skills Intelligence & ROI Analysis
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Current Skills Market Value */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-6 h-6 text-purple-600 mr-2" />
                Your Skills Market Value
              </h3>
              <div className="space-y-4">
                {(reportData.skillsIntelligence?.currentSkills || [
                  { skill: 'JavaScript', demand: 'Very High', avgSalaryBoost: '+15%', jobs: 45000 },
                  { skill: 'React', demand: 'High', avgSalaryBoost: '+12%', jobs: 28000 },
                  { skill: 'AWS', demand: 'Very High', avgSalaryBoost: '+22%', jobs: 38000 }
                ]).slice(0, 5).map((skill, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{skill.skill}</span>
                      <span className="text-sm font-bold text-purple-600">{skill.avgSalaryBoost}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Demand: {skill.demand}</span>
                      <span>{skill.jobs?.toLocaleString()} jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 text-orange-600 mr-2" />
                Priority Skills to Develop
              </h3>
              <div className="space-y-4">
                {(reportData.skillsIntelligence?.skillGaps || [
                  { skill: 'Kubernetes', priority: 'High', salaryImpact: '+25%', timeToAcquire: '3-6 months' },
                  { skill: 'Machine Learning', priority: 'High', salaryImpact: '+28%', timeToAcquire: '6-12 months' },
                  { skill: 'DevOps', priority: 'Medium', salaryImpact: '+20%', timeToAcquire: '3-6 months' }
                ]).slice(0, 4).map((gap, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{gap.skill}</span>
                      <span className="text-sm font-bold text-orange-600">{gap.salaryImpact}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Priority: {gap.priority}</span>
                      <span>{gap.timeToAcquire}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning ROI Calculator */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              Learning Investment ROI Calculator
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {(reportData.skillsIntelligence?.skillsROI || [
                { skill: 'AWS Certification', currentValue: '+22%', investmentCost: '$3,000', roi: '650%', paybackPeriod: '6 months' },
                { skill: 'Kubernetes', currentValue: '+25%', investmentCost: '$2,500', roi: '800%', paybackPeriod: '4 months' },
                { skill: 'Machine Learning', currentValue: '+28%', investmentCost: '$4,000', roi: '700%', paybackPeriod: '8 months' }
              ]).slice(0, 3).map((roi, index) => (
                <div key={index} className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2">{roi.skill}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-semibold">{roi.investmentCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary Boost:</span>
                      <span className="font-semibold text-green-600">{roi.currentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI:</span>
                      <span className="font-bold text-green-700">{roi.roi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback:</span>
                      <span className="font-semibold">{roi.paybackPeriod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Strategy & Timeline */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Clock className="w-8 h-8 text-indigo-600 mr-4" />
            Strategic Career Roadmap
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* AI-Powered Strategies */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="w-6 h-6 text-indigo-600 mr-2" />
                AI-Powered Career Strategies
              </h3>
              <div className="space-y-4">
                {(reportData.careerStrategy?.aiStrategies || [
                  { strategy: 'Skill Arbitrage Opportunity', impact: 'High', timeframe: '3-6 months', description: 'Your skills are undervalued in current market' },
                  { strategy: 'Leadership Transition Path', impact: 'Very High', timeframe: '6-12 months', description: 'Technical depth positions you for leadership' },
                  { strategy: 'Specialization Premium', impact: 'High', timeframe: '12-18 months', description: 'Deep AI/ML expertise commands premium' }
                ]).map((strategy, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-indigo-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{strategy.strategy}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        strategy.impact === 'Very High' ? 'bg-green-100 text-green-700' :
                        strategy.impact === 'High' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {strategy.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Timeline: {strategy.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Roadmap */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-6 h-6 text-green-600 mr-2" />
                90-Day Action Plan
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData.careerStrategy?.timelineRoadmap || {
                  '0-3 months': ['Update LinkedIn with target keywords', 'Begin AWS certification', 'Network with 10 industry leaders'],
                  '3-6 months': ['Complete certification', 'Build portfolio project', 'Apply to target roles'],
                  '6-12 months': ['Secure new role', 'Establish leadership', 'Plan advancement']
                }).slice(0, 3).map(([period, actions], index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-green-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{period}</h4>
                    <ul className="space-y-1">
                      {actions.slice(0, 3).map((action, actionIndex) => (
                        <li key={actionIndex} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Career Paths */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Career Paths</h2>
          <div className="space-y-6">
            {(reportData.careerPaths || []).map((path, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {path.growthPotential} Growth
                      </span>
                      <span>{path.salaryRange}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">{path.score}</div>
                    <div className="text-sm text-gray-500">Match Score</div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">{path.description}</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Why This is AI-Proof
                  </h4>
                  <p className="text-green-700 text-sm">{path.aiProofReason}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {(path.skills || []).map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Next Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {(path.nextSteps || []).slice(0, 3).map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Proof Skills */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI-Proof Skills Profile</h2>
          <div className="space-y-4">
            {(reportData.aiProofSkills || []).map((skill, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{skill.skill}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${skill.strength}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8">{skill.strength}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Key Recommendations</h2>
            <ul className="space-y-3">
              {(reportData.recommendations || []).map((rec, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Next Steps</h2>
            <ul className="space-y-3">
              {(reportData.nextSteps || []).map((step, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8">
          <p className="text-gray-500 text-sm">
            Generated by ElephantScale AI Career Partner • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;
