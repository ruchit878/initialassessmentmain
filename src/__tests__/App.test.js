import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock all the components to avoid complex routing issues in tests
jest.mock('../components/LandingPage', () => {
  return function MockLandingPage() {
    return <div data-testid="landing-page">Landing Page</div>;
  };
});

jest.mock('../components/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

jest.mock('../components/ResumeUpload', () => {
  return function MockResumeUpload() {
    return <div data-testid="resume-upload">Resume Upload</div>;
  };
});

jest.mock('../components/AnalysisSelection', () => {
  return function MockAnalysisSelection() {
    return <div data-testid="analysis-selection">Analysis Selection</div>;
  };
});

jest.mock('../components/PsychometricAssessment', () => {
  return function MockPsychometricAssessment() {
    return <div data-testid="psychometric-assessment">Psychometric Assessment</div>;
  };
});

jest.mock('../components/ReportGeneration', () => {
  return function MockReportGeneration() {
    return <div data-testid="report-generation">Report Generation</div>;
  };
});

describe('App', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('landing-page')).toBeInTheDocument();
  });

  test('has correct CSS classes applied', () => {
    const { container } = render(<App />);
    const appDiv = container.querySelector('.App');
    expect(appDiv).toHaveClass('min-h-screen', 'bg-white');
  });
});
