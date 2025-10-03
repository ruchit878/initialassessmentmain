import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import AnalysisSelection from './components/AnalysisSelection';
import PsychometricAssessment from './components/PsychometricAssessment';
import ReportGeneration from './components/ReportGeneration';
import TestingComponent from './components/TestingComponent';

function App() {
  const [user, setUser] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [analysisType, setAnalysisType] = useState(null);
  const [psychometricResults, setPsychometricResults] = useState(null);

  return (
    <Router>
      <div className="App min-h-screen bg-white">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage user={user} setUser={setUser} />} 
          />
          <Route 
            path="/dashboard" 
            element={<Dashboard user={user} />} 
          />
          <Route 
            path="/upload" 
            element={
              <ResumeUpload 
                user={user} 
                resumeData={resumeData} 
                setResumeData={setResumeData} 
              />
            } 
          />
          <Route 
            path="/analysis" 
            element={
              <AnalysisSelection 
                resumeData={resumeData} 
                setAnalysisType={setAnalysisType} 
              />
            } 
          />
          <Route 
            path="/psychometric" 
            element={
              <PsychometricAssessment 
                resumeData={resumeData}
                setPsychometricResults={setPsychometricResults} 
              />
            } 
          />
          <Route 
            path="/report" 
            element={
              <ReportGeneration 
                resumeData={resumeData}
                analysisType={analysisType}
                psychometricResults={psychometricResults}
              />
            } 
          />
          <Route
            path="/testing"
            element={<TestingComponent />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
