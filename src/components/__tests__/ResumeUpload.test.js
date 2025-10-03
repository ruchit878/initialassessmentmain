import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import ResumeUpload from '../ResumeUpload';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ResumeUpload', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com'
  };

  const mockSetResumeData = jest.fn();

  beforeEach(() => {
    mockNavigate.mockClear();
    mockSetResumeData.mockClear();
  });

  test('renders upload interface', () => {
    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={null} 
        setResumeData={mockSetResumeData} 
      />
    );
    
    expect(screen.getByText('Upload Your Resume')).toBeInTheDocument();
    expect(screen.getByText('Upload your resume to begin your personalized career analysis')).toBeInTheDocument();
  });

  test('displays dropzone with correct text', () => {
    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={null} 
        setResumeData={mockSetResumeData} 
      />
    );
    
    expect(screen.getByText('Upload your resume')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your resume, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports PDF, DOC, and DOCX files up to 10MB')).toBeInTheDocument();
  });

  test('shows processing state during upload', async () => {
    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={null} 
        setResumeData={mockSetResumeData} 
      />
    );

    const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText('Upload your resume').closest('div');
    
    Object.defineProperty(dropzone, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Processing your resume...')).toBeInTheDocument();
    });
  });

  test('displays success state with resume data', () => {
    const mockResumeData = {
      fileName: 'test-resume.pdf',
      fileSize: 1024,
      uploadDate: new Date().toISOString(),
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: '5 years',
      industry: 'Technology',
      education: 'Bachelor\'s in Computer Science',
      currentRole: 'Software Developer'
    };

    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={mockResumeData} 
        setResumeData={mockSetResumeData} 
      />
    );

    expect(screen.getByText('Resume uploaded successfully!')).toBeInTheDocument();
    expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('5 years')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
  });

  test('continue button navigates to analysis', () => {
    const mockResumeData = {
      fileName: 'test-resume.pdf',
      skills: ['JavaScript', 'React'],
      experience: '5 years',
      industry: 'Technology',
      currentRole: 'Software Developer'
    };

    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={mockResumeData} 
        setResumeData={mockSetResumeData} 
      />
    );

    const continueButton = screen.getByText('Continue to Analysis Options');
    fireEvent.click(continueButton);
    expect(mockNavigate).toHaveBeenCalledWith('/analysis');
  });

  test('back button navigates to dashboard', () => {
    renderWithRouter(
      <ResumeUpload 
        user={mockUser} 
        resumeData={null} 
        setResumeData={mockSetResumeData} 
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('redirects when no user', () => {
    renderWithRouter(
      <ResumeUpload 
        user={null} 
        resumeData={null} 
        setResumeData={mockSetResumeData} 
      />
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
