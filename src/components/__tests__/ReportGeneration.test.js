import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ReportGeneration from '../ReportGeneration';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    internal: { pageSize: { width: 210 } },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(['line 1', 'line 2']),
    addPage: jest.fn(),
    save: jest.fn(),
  }));
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ReportGeneration', () => {
  const mockResumeData = {
    fileName: 'test-resume.pdf',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
    experience: '5 years',
    industry: 'Technology',
    currentRole: 'Software Developer'
  };

  const mockPsychometricResults = {
    personalityType: 'INTJ - The Architect',
    traits: {
      analytical: 80,
      leadership: 60,
      innovation: 70,
      collaboration: 50,
      adaptability: 65
    },
    completedAt: new Date().toISOString()
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('shows loading state initially', () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    expect(screen.getByText('Generating Your Report')).toBeInTheDocument();
    expect(screen.getByText(/Our AI is analyzing your profile/)).toBeInTheDocument();
  });

  test('displays loading steps', () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    expect(screen.getByText('Analyzing resume data')).toBeInTheDocument();
    expect(screen.getByText('Processing market trends')).toBeInTheDocument();
    expect(screen.getByText('Generating career recommendations')).toBeInTheDocument();
  });

  test('renders report after loading completes', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="detailed" 
        psychometricResults={mockPsychometricResults} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your Career Analysis Report')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('displays analysis type and personality type', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="detailed" 
        psychometricResults={mockPsychometricResults} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      expect(screen.getByText('INTJ - The Architect')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('shows executive summary', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText('5 years')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('displays career path recommendations', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Recommended Career Paths')).toBeInTheDocument();
      expect(screen.getByText('AI/ML Solutions Architect')).toBeInTheDocument();
      expect(screen.getByText('Technical Product Manager')).toBeInTheDocument();
      expect(screen.getByText('DevOps Engineering Lead')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('shows AI-proof skills profile', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Your AI-Proof Skills Profile')).toBeInTheDocument();
      expect(screen.getByText('Creative Problem Solving')).toBeInTheDocument();
      expect(screen.getByText('Strategic Thinking')).toBeInTheDocument();
      expect(screen.getByText('Leadership & Communication')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('displays recommendations and next steps', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Next Steps')).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('download PDF button works', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      const downloadButton = screen.getByText('Download PDF');
      fireEvent.click(downloadButton);
      // PDF generation is mocked, so we just verify the button exists and is clickable
      expect(downloadButton).toBeInTheDocument();
    }, { timeout: 4000 });
  });

  test('back button navigates to dashboard', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 4000 });
  });

  test('redirects when no resume data', () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={null} 
        analysisType="quick" 
        psychometricResults={null} 
      />
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  test('shows additional career paths for detailed analysis', async () => {
    renderWithRouter(
      <ReportGeneration 
        resumeData={mockResumeData} 
        analysisType="detailed" 
        psychometricResults={mockPsychometricResults} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Technology Consultant')).toBeInTheDocument();
      expect(screen.getByText('Engineering Manager')).toBeInTheDocument();
    }, { timeout: 4000 });
  });
});
