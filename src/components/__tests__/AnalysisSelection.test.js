import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AnalysisSelection from '../AnalysisSelection';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AnalysisSelection', () => {
  const mockResumeData = {
    fileName: 'test-resume.pdf',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '5 years',
    industry: 'Technology',
    currentRole: 'Software Developer'
  };

  const mockSetAnalysisType = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetAnalysisType.mockClear();
  });

  test('renders analysis selection page', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('Choose Your Analysis Type')).toBeInTheDocument();
    expect(screen.getByText('Select the type of career analysis that best fits your needs')).toBeInTheDocument();
  });

  test('displays both analysis options', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('Quick Report')).toBeInTheDocument();
    expect(screen.getByText('Detailed Report with Psychometric Analysis')).toBeInTheDocument();
    expect(screen.getByText('RECOMMENDED')).toBeInTheDocument();
  });

  test('shows correct time estimates', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('5-10 minutes')).toBeInTheDocument();
    expect(screen.getByText('15-20 minutes')).toBeInTheDocument();
  });

  test('displays quick report features', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('Resume-based career path analysis')).toBeInTheDocument();
    expect(screen.getByText('3 AI-proof career recommendations')).toBeInTheDocument();
    expect(screen.getByText('Skills gap analysis')).toBeInTheDocument();
    expect(screen.getByText('Market viability scores')).toBeInTheDocument();
  });

  test('displays detailed report features', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('Everything in Quick Report')).toBeInTheDocument();
    expect(screen.getByText('Industry-specific psychometric assessment')).toBeInTheDocument();
    expect(screen.getByText('Personality-matched career paths')).toBeInTheDocument();
    expect(screen.getByText('Alternative career suggestions')).toBeInTheDocument();
    expect(screen.getByText('Detailed action plan')).toBeInTheDocument();
  });

  test('quick analysis button works correctly', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    const quickButton = screen.getByText('Generate Quick Report');
    fireEvent.click(quickButton);
    
    expect(mockSetAnalysisType).toHaveBeenCalledWith('quick');
    expect(mockNavigate).toHaveBeenCalledWith('/report');
  });

  test('detailed analysis button works correctly', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    const detailedButton = screen.getByText('Start Psychometric Assessment');
    fireEvent.click(detailedButton);
    
    expect(mockSetAnalysisType).toHaveBeenCalledWith('detailed');
    expect(mockNavigate).toHaveBeenCalledWith('/psychometric');
  });

  test('displays resume summary', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={mockResumeData} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(screen.getByText('Resume Summary')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('5 years')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
  });

  test('redirects when no resume data', () => {
    renderWithRouter(
      <AnalysisSelection 
        resumeData={null} 
        setAnalysisType={mockSetAnalysisType} 
      />
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });
});
