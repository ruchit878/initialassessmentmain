import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, ArrowRight, Clock, Target } from 'lucide-react';

const AnalysisSelection = ({ resumeData, setAnalysisType }) => {
  const navigate = useNavigate();

  if (!resumeData) {
    navigate('/upload');
    return null;
  }

  const handleQuickAnalysis = () => {
    setAnalysisType('quick');
    navigate('/report');
  };

  const handleDetailedAnalysis = () => {
    setAnalysisType('detailed');
    navigate('/psychometric');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ElephantScale</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Analysis Type
            </h1>
            <p className="text-lg text-gray-600">
              Select the type of career analysis that best fits your needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Quick Analysis Option */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-6">
                  <FileText className="w-8 h-8 text-primary-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Quick Report
                </h3>
                
                <div className="flex items-center justify-center mb-6">
                  <Clock className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">5-10 minutes</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Resume-based career path analysis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">3 AI-proof career recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Skills gap analysis</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Market viability scores</span>
                  </li>
                </ul>

                <button
                  onClick={handleQuickAnalysis}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Generate Quick Report
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>

            {/* Detailed Analysis Option */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-primary-200">
              <div className="bg-primary-50 px-4 py-2">
                <span className="text-primary-700 font-medium text-sm">RECOMMENDED</span>
              </div>
              
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-lg mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                  Detailed Report with Psychometric Analysis
                </h3>
                
                <div className="flex items-center justify-center mb-6">
                  <Target className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">15-20 minutes</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Everything in Quick Report</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Industry-specific psychometric assessment</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Personality-matched career paths</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Alternative career suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <span className="ml-3 text-gray-700">Detailed action plan</span>
                  </li>
                </ul>

                <button
                  onClick={handleDetailedAnalysis}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium flex items-center justify-center"
                >
                  Start Psychometric Assessment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Resume Summary */}
          <div className="mt-12 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Resume Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Industry:</span>
                <span className="ml-2 text-gray-600">{resumeData.industry}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Experience:</span>
                <span className="ml-2 text-gray-600">{resumeData.experience}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Current Role:</span>
                <span className="ml-2 text-gray-600">{resumeData.currentRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSelection;
