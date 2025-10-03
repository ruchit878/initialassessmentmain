import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const PsychometricAssessment = ({ resumeData, setPsychometricResults }) => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);

  if (!resumeData) {
    navigate('/upload');
    return null;
  }

  // Comprehensive psychometric assessment with 15 detailed questions
  const questions = [
    {
      id: 1,
      category: "Problem Solving",
      question: "When facing a complex problem at work, what's your natural approach?",
      options: [
        { value: 'analytical', text: "Break it down systematically and analyze each component methodically", traits: { analytical: 3, detail_oriented: 2 } },
        { value: 'collaborative', text: "Gather input from colleagues and stakeholders before proceeding", traits: { collaborative: 3, empathetic: 2 } },
        { value: 'intuitive', text: "Trust my instincts and experience to guide the solution", traits: { intuitive: 3, confident: 2 } },
        { value: 'research', text: "Research extensively and study similar cases before acting", traits: { analytical: 2, cautious: 3 } }
      ]
    },
    {
      id: 2,
      category: "Leadership Style",
      question: "How do you prefer to influence and motivate others?",
      options: [
        { value: 'directive', text: "Provide clear direction and expectations with structured guidance", traits: { leadership: 3, organized: 2 } },
        { value: 'inspirational', text: "Share vision and inspire others through enthusiasm and passion", traits: { charismatic: 3, visionary: 2 } },
        { value: 'collaborative', text: "Build consensus and involve everyone in decision-making", traits: { collaborative: 3, diplomatic: 2 } },
        { value: 'supportive', text: "Focus on developing others and providing mentorship", traits: { empathetic: 3, nurturing: 2 } }
      ]
    },
    {
      id: 3,
      category: "Work Environment",
      question: "What type of work environment brings out your best performance?",
      options: [
        { value: 'structured', text: "Well-organized with clear processes and predictable routines", traits: { organized: 3, detail_oriented: 2 } },
        { value: 'dynamic', text: "Fast-paced with variety and constant new challenges", traits: { adaptable: 3, energetic: 2 } },
        { value: 'autonomous', text: "Independent work with minimal supervision and maximum flexibility", traits: { independent: 3, self_motivated: 2 } },
        { value: 'collaborative', text: "Team-oriented with frequent interaction and shared goals", traits: { collaborative: 3, social: 2 } }
      ]
    },
    {
      id: 4,
      category: "Decision Making",
      question: "When making important decisions, you typically:",
      options: [
        { value: 'data_driven', text: "Rely heavily on data, metrics, and objective analysis", traits: { analytical: 3, logical: 2 } },
        { value: 'consultative', text: "Seek input from trusted advisors and stakeholders", traits: { collaborative: 2, cautious: 3 } },
        { value: 'intuitive', text: "Trust your gut feeling and past experience", traits: { intuitive: 3, confident: 2 } },
        { value: 'balanced', text: "Combine data analysis with intuition and stakeholder input", traits: { balanced: 3, thoughtful: 2 } }
      ]
    },
    {
      id: 5,
      category: "Innovation",
      question: "How do you approach innovation and new ideas?",
      options: [
        { value: 'pioneer', text: "Love being first to try new approaches and technologies", traits: { innovative: 3, risk_taking: 2 } },
        { value: 'improver', text: "Prefer to enhance and optimize existing solutions", traits: { analytical: 2, practical: 3 } },
        { value: 'evaluator', text: "Carefully assess new ideas before considering adoption", traits: { cautious: 3, analytical: 2 } },
        { value: 'synthesizer', text: "Combine different ideas to create unique solutions", traits: { creative: 3, innovative: 2 } }
      ]
    },
    {
      id: 6,
      category: "Communication",
      question: "Your preferred communication style is:",
      options: [
        { value: 'direct', text: "Straightforward and concise, getting straight to the point", traits: { direct: 3, efficient: 2 } },
        { value: 'diplomatic', text: "Tactful and considerate, focusing on maintaining relationships", traits: { diplomatic: 3, empathetic: 2 } },
        { value: 'detailed', text: "Comprehensive and thorough, covering all relevant information", traits: { detail_oriented: 3, thorough: 2 } },
        { value: 'inspiring', text: "Engaging and motivational, focusing on vision and possibilities", traits: { charismatic: 3, visionary: 2 } }
      ]
    },
    {
      id: 7,
      category: "Stress Management",
      question: "Under pressure or stress, you tend to:",
      options: [
        { value: 'systematic', text: "Become more organized and systematic in your approach", traits: { organized: 3, resilient: 2 } },
        { value: 'collaborative', text: "Seek support and input from others", traits: { collaborative: 2, social: 3 } },
        { value: 'focused', text: "Narrow your focus and work independently to solve the issue", traits: { focused: 3, independent: 2 } },
        { value: 'adaptive', text: "Quickly adjust your approach and find alternative solutions", traits: { adaptable: 3, flexible: 2 } }
      ]
    },
    {
      id: 8,
      category: "Learning Style",
      question: "How do you prefer to learn and develop new skills?",
      options: [
        { value: 'hands_on', text: "Through practical experience and trial-and-error", traits: { practical: 3, experiential: 2 } },
        { value: 'theoretical', text: "By studying concepts, frameworks, and best practices first", traits: { analytical: 2, studious: 3 } },
        { value: 'social', text: "Through mentorship, collaboration, and peer learning", traits: { social: 3, collaborative: 2 } },
        { value: 'structured', text: "Via formal training programs and structured curricula", traits: { organized: 2, disciplined: 3 } }
      ]
    },
    {
      id: 9,
      category: "Risk Tolerance",
      question: "Your attitude toward professional risk-taking is:",
      options: [
        { value: 'high_risk', text: "Embrace high-risk, high-reward opportunities", traits: { risk_taking: 3, ambitious: 2 } },
        { value: 'calculated', text: "Take calculated risks after thorough analysis", traits: { analytical: 2, strategic: 3 } },
        { value: 'conservative', text: "Prefer proven approaches with predictable outcomes", traits: { cautious: 3, stable: 2 } },
        { value: 'opportunistic', text: "Adapt risk tolerance based on specific opportunities", traits: { adaptable: 2, strategic: 3 } }
      ]
    },
    {
      id: 10,
      category: "Goal Orientation",
      question: "What motivates you most in your career?",
      options: [
        { value: 'achievement', text: "Accomplishing challenging goals and exceeding expectations", traits: { ambitious: 3, driven: 2 } },
        { value: 'growth', text: "Continuous learning and personal development", traits: { growth_oriented: 3, curious: 2 } },
        { value: 'impact', text: "Making a meaningful difference and creating value", traits: { purpose_driven: 3, impactful: 2 } },
        { value: 'recognition', text: "Being acknowledged as an expert and thought leader", traits: { recognition_seeking: 3, confident: 2 } }
      ]
    },
    {
      id: 11,
      category: "Change Management",
      question: "When facing organizational change, you typically:",
      options: [
        { value: 'champion', text: "Enthusiastically support and help drive the change", traits: { change_agent: 3, optimistic: 2 } },
        { value: 'adapter', text: "Quickly adjust and find ways to work within new systems", traits: { adaptable: 3, flexible: 2 } },
        { value: 'analyzer', text: "Carefully evaluate the change before fully embracing it", traits: { analytical: 2, cautious: 3 } },
        { value: 'stabilizer', text: "Focus on maintaining stability and supporting others through transition", traits: { supportive: 3, stable: 2 } }
      ]
    },
    {
      id: 12,
      category: "Work-Life Integration",
      question: "How do you approach work-life balance?",
      options: [
        { value: 'integrated', text: "Blend work and personal life seamlessly throughout the day", traits: { flexible: 3, balanced: 2 } },
        { value: 'compartmentalized', text: "Keep work and personal life clearly separated", traits: { organized: 2, disciplined: 3 } },
        { value: 'work_focused', text: "Prioritize career advancement and professional achievement", traits: { ambitious: 3, driven: 2 } },
        { value: 'life_focused', text: "Ensure personal time and relationships take priority", traits: { balanced: 3, value_driven: 2 } }
      ]
    },
    {
      id: 13,
      category: "Conflict Resolution",
      question: "When conflicts arise in your team, you prefer to:",
      options: [
        { value: 'mediator', text: "Facilitate discussions to help parties find common ground", traits: { diplomatic: 3, empathetic: 2 } },
        { value: 'problem_solver', text: "Focus on identifying root causes and practical solutions", traits: { analytical: 2, practical: 3 } },
        { value: 'direct', text: "Address issues head-on with clear, honest communication", traits: { direct: 3, courageous: 2 } },
        { value: 'collaborative', text: "Involve all stakeholders in developing resolution strategies", traits: { collaborative: 3, inclusive: 2 } }
      ]
    },
    {
      id: 14,
      category: "Technology Adoption",
      question: "Your approach to new technologies and tools is:",
      options: [
        { value: 'early_adopter', text: "Excited to try cutting-edge technologies immediately", traits: { innovative: 3, curious: 2 } },
        { value: 'strategic', text: "Evaluate technologies based on business value and ROI", traits: { strategic: 3, practical: 2 } },
        { value: 'cautious', text: "Wait for technologies to mature before adoption", traits: { cautious: 3, risk_averse: 2 } },
        { value: 'selective', text: "Choose technologies that align with specific goals", traits: { focused: 2, strategic: 3 } }
      ]
    },
    {
      id: 15,
      category: "Career Vision",
      question: "Looking ahead, your ideal career trajectory involves:",
      options: [
        { value: 'leadership', text: "Moving into executive leadership and strategic roles", traits: { leadership: 3, ambitious: 2 } },
        { value: 'expertise', text: "Becoming a recognized expert and thought leader in your field", traits: { expertise_focused: 3, studious: 2 } },
        { value: 'entrepreneurial', text: "Starting your own venture or leading innovative projects", traits: { entrepreneurial: 3, risk_taking: 2 } },
        { value: 'balanced', text: "Achieving success while maintaining personal fulfillment", traits: { balanced: 3, value_driven: 2 } }
      ]
    }
  ];

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = () => {
    // Analyze answers and generate personality profile
    const traits = analyzeAnswers(answers);
    const personalityProfile = generatePersonalityType(traits);
    const results = {
      personalityType: personalityProfile.type, // Just the string for compatibility
      personalityProfile: personalityProfile, // Full object for detailed analysis
      traits: personalityProfile, // Use the full profile as traits
      completedAt: new Date().toISOString(),
      answers: answers
    };
    
    setPsychometricResults(results);
    setIsComplete(true);
    
    // Navigate to report after a brief delay
    setTimeout(() => {
      navigate('/report');
    }, 2000);
  };

  const analyzeAnswers = (answers) => {
    const traitScores = {
      // Core personality traits
      analytical: 0, leadership: 0, collaborative: 0, innovative: 0, adaptable: 0,
      empathetic: 0, confident: 0, cautious: 0, organized: 0, detail_oriented: 0,
      charismatic: 0, visionary: 0, diplomatic: 0, nurturing: 0, energetic: 0,
      independent: 0, self_motivated: 0, social: 0, logical: 0, balanced: 0,
      thoughtful: 0, creative: 0, practical: 0, direct: 0, efficient: 0,
      thorough: 0, focused: 0, flexible: 0, experiential: 0, studious: 0,
      disciplined: 0, risk_taking: 0, ambitious: 0, strategic: 0, stable: 0,
      driven: 0, growth_oriented: 0, curious: 0, purpose_driven: 0, impactful: 0,
      recognition_seeking: 0, change_agent: 0, optimistic: 0, supportive: 0,
      value_driven: 0, courageous: 0, inclusive: 0, risk_averse: 0,
      expertise_focused: 0, entrepreneurial: 0, resilient: 0
    };

    // Analyze each answer and accumulate trait scores
    Object.entries(answers).forEach(([questionId, answerValue]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        const selectedOption = question.options.find(opt => opt.value === answerValue);
        if (selectedOption && selectedOption.traits) {
          Object.entries(selectedOption.traits).forEach(([trait, score]) => {
            if (traitScores.hasOwnProperty(trait)) {
              traitScores[trait] += score;
            }
          });
        }
      }
    });

    return traitScores;
  };

  const generatePersonalityType = (traits) => {
    // Get top 5 traits
    const sortedTraits = Object.entries(traits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Generate personality profile based on dominant traits
    const dominantTraits = sortedTraits.map(([trait]) => trait);
    
    // Determine personality type based on trait combinations
    let personalityType = 'Balanced Professional';
    let description = 'A well-rounded professional with diverse strengths';
    
    if (traits.leadership >= 8 && traits.strategic >= 6) {
      personalityType = 'Strategic Leader';
      description = 'Natural leader who excels at strategic thinking and driving organizational success';
    } else if (traits.analytical >= 8 && traits.detail_oriented >= 6) {
      personalityType = 'Analytical Thinker';
      description = 'Detail-oriented problem solver who excels at systematic analysis and logical reasoning';
    } else if (traits.innovative >= 8 && traits.creative >= 6) {
      personalityType = 'Creative Innovator';
      description = 'Forward-thinking individual who thrives on creating new solutions and pushing boundaries';
    } else if (traits.collaborative >= 8 && traits.empathetic >= 6) {
      personalityType = 'Collaborative Facilitator';
      description = 'People-focused professional who excels at building relationships and facilitating teamwork';
    } else if (traits.entrepreneurial >= 8 && traits.risk_taking >= 6) {
      personalityType = 'Entrepreneurial Visionary';
      description = 'Bold innovator who thrives on creating new ventures and taking calculated risks';
    } else if (traits.expertise_focused >= 8 && traits.studious >= 6) {
      personalityType = 'Subject Matter Expert';
      description = 'Deep specialist who excels at mastering complex domains and sharing knowledge';
    } else if (traits.adaptable >= 8 && traits.flexible >= 6) {
      personalityType = 'Adaptive Professional';
      description = 'Versatile individual who thrives in changing environments and embraces new challenges';
    } else if (traits.organized >= 8 && traits.disciplined >= 6) {
      personalityType = 'Systematic Organizer';
      description = 'Highly organized professional who excels at creating structure and ensuring efficiency';
    }

    return {
      type: personalityType,
      description: description,
      dominantTraits: sortedTraits.slice(0, 3).map(([trait, score]) => ({
        trait: trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: Math.round((score / 15) * 100) // Convert to percentage
      })),
      allTraits: sortedTraits.map(([trait, score]) => ({
        trait: trait.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: Math.round((score / 15) * 100)
      }))
    };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Complete!</h2>
          <p className="text-gray-600 mb-4">
            Generating your personalized career report...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
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
              <h1 className="text-xl font-bold text-gray-900">ElephantScale</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Psychometric Assessment
            </h1>
            <p className="text-gray-600">
              Answer honestly to get the most accurate career recommendations
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    answers[currentQ.id] === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option.value}
                    checked={answers[currentQ.id] === option.value}
                    onChange={() => handleAnswerSelect(currentQ.id, option.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      answers[currentQ.id] === option.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQ.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-700">{option.text}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                !answers[currentQ.id]
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychometricAssessment;
