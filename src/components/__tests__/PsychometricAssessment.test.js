import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import PsychometricAssessment from '../PsychometricAssessment';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PsychometricAssessment', () => {
  const mockResumeData = {
    fileName: 'test-resume.pdf',
    skills: ['JavaScript', 'React', 'Node.js'],
    experience: '5 years',
    industry: 'Technology',
    currentRole: 'Software Developer'
  };

  const mockSetPsychometricResults = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetPsychometricResults.mockClear();
  });

  test('renders assessment page with first question', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    expect(screen.getByText('Psychometric Assessment')).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.getByText(/When facing a complex technical problem/)).toBeInTheDocument();
  });

  test('displays progress bar', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const progressBar = document.querySelector('[style*="width: 20%"]');
    expect(progressBar).toBeInTheDocument();
  });

  test('shows answer options for first question', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    expect(screen.getByText(/Break it down systematically/)).toBeInTheDocument();
    expect(screen.getByText(/Discuss with team members/)).toBeInTheDocument();
    expect(screen.getByText(/Try different solutions/)).toBeInTheDocument();
    expect(screen.getByText(/Research best practices/)).toBeInTheDocument();
  });

  test('allows selecting an answer', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const firstOption = screen.getByText(/Break it down systematically/);
    fireEvent.click(firstOption);
    
    const radioInput = firstOption.closest('label').querySelector('input');
    expect(radioInput).toBeChecked();
  });

  test('next button is disabled when no answer selected', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  test('next button is enabled when answer is selected', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const firstOption = screen.getByText(/Break it down systematically/);
    fireEvent.click(firstOption);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).not.toBeDisabled();
  });

  test('previous button is disabled on first question', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeDisabled();
  });

  test('navigates to next question when next is clicked', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    const firstOption = screen.getByText(/Break it down systematically/);
    fireEvent.click(firstOption);
    
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    
    expect(screen.getByText('Question 2 of 5')).toBeInTheDocument();
    expect(screen.getByText(/How do you typically handle uncertainty/)).toBeInTheDocument();
  });

  test('shows complete button on last question', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    // Navigate to last question by clicking through all questions
    for (let i = 0; i < 4; i++) {
      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);
      const nextButton = screen.getByText(i === 3 ? 'Complete' : 'Next');
      if (i < 3) fireEvent.click(nextButton);
    }
    
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  test('completes assessment and shows completion screen', async () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={mockResumeData} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    // Answer all questions
    for (let i = 0; i < 5; i++) {
      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);
      const nextButton = screen.getByText(i === 4 ? 'Complete' : 'Next');
      fireEvent.click(nextButton);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Assessment Complete!')).toBeInTheDocument();
    });
  });

  test('redirects when no resume data', () => {
    renderWithRouter(
      <PsychometricAssessment 
        resumeData={null} 
        setPsychometricResults={mockSetPsychometricResults} 
      />
    );
    
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });
});
