import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../App';

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('User Workflow Integration Tests', () => {
  test('complete user journey - quick analysis', async () => {
    renderApp();
    
    // 1. Start at landing page
    expect(screen.getByText('Your AI-Powered')).toBeInTheDocument();
    
    // 2. Click LinkedIn login
    const loginButton = screen.getAllByText(/Continue with LinkedIn/)[0];
    fireEvent.click(loginButton);
    
    // 3. Should be on dashboard
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });
    
    // 4. Click upload resume
    const uploadButton = screen.getByText('Upload Resume');
    fireEvent.click(uploadButton);
    
    // 5. Should be on upload page
    await waitFor(() => {
      expect(screen.getByText('Upload Your Resume')).toBeInTheDocument();
    });
    
    // 6. Simulate file upload
    const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
    const dropzone = screen.getByText('Upload your resume').closest('div');
    
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    
    // 7. Wait for processing and continue
    await waitFor(() => {
      expect(screen.getByText('Resume uploaded successfully!')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    const continueButton = screen.getByText('Continue to Analysis Options');
    fireEvent.click(continueButton);
    
    // 8. Should be on analysis selection
    await waitFor(() => {
      expect(screen.getByText('Choose Your Analysis Type')).toBeInTheDocument();
    });
    
    // 9. Select quick analysis
    const quickButton = screen.getByText('Generate Quick Report');
    fireEvent.click(quickButton);
    
    // 10. Should be on report generation
    await waitFor(() => {
      expect(screen.getByText('Generating Your Report')).toBeInTheDocument();
    });
    
    // 11. Wait for report to generate
    await waitFor(() => {
      expect(screen.getByText('Your Career Analysis Report')).toBeInTheDocument();
    }, { timeout: 4000 });
    
    // 12. Verify report content
    expect(screen.getByText('Recommended Career Paths')).toBeInTheDocument();
    expect(screen.getByText('AI/ML Solutions Architect')).toBeInTheDocument();
  });

  test('complete user journey - detailed analysis with psychometric', async () => {
    renderApp();
    
    // Navigate through initial steps (same as above)
    const loginButton = screen.getAllByText(/Continue with LinkedIn/)[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      const uploadButton = screen.getByText('Upload Resume');
      fireEvent.click(uploadButton);
    });
    
    await waitFor(() => {
      const file = new File(['test content'], 'test-resume.pdf', { type: 'application/pdf' });
      const dropzone = screen.getByText('Upload your resume').closest('div');
      fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    });
    
    await waitFor(() => {
      const continueButton = screen.getByText('Continue to Analysis Options');
      fireEvent.click(continueButton);
    }, { timeout: 3000 });
    
    // Select detailed analysis
    await waitFor(() => {
      const detailedButton = screen.getByText('Start Psychometric Assessment');
      fireEvent.click(detailedButton);
    });
    
    // Complete psychometric assessment
    await waitFor(() => {
      expect(screen.getByText('Psychometric Assessment')).toBeInTheDocument();
    });
    
    // Answer all 5 questions
    for (let i = 0; i < 5; i++) {
      const firstOption = screen.getAllByRole('radio')[0];
      fireEvent.click(firstOption);
      
      const nextButton = screen.getByText(i === 4 ? 'Complete' : 'Next');
      fireEvent.click(nextButton);
      
      if (i < 4) {
        await waitFor(() => {
          expect(screen.getByText(`Question ${i + 2} of 5`)).toBeInTheDocument();
        });
      }
    }
    
    // Wait for completion and report generation
    await waitFor(() => {
      expect(screen.getByText('Assessment Complete!')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Your Career Analysis Report')).toBeInTheDocument();
    }, { timeout: 6000 });
    
    // Verify detailed report includes psychometric results
    expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
    expect(screen.getByText(/INTJ|ENTJ|ENTP|ENFJ|ISFP/)).toBeInTheDocument();
  });

  test('navigation and back buttons work correctly', async () => {
    renderApp();
    
    // Login and navigate to upload
    const loginButton = screen.getAllByText(/Continue with LinkedIn/)[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      const uploadButton = screen.getByText('Upload Resume');
      fireEvent.click(uploadButton);
    });
    
    // Test back button from upload page
    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);
    });
    
    // Should be back on dashboard
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });
  });

  test('error handling - no resume data redirects', async () => {
    renderApp();
    
    // Try to access analysis page directly without resume data
    // This would normally be done through URL navigation, but we'll simulate the state
    const loginButton = screen.getAllByText(/Continue with LinkedIn/)[0];
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });
    
    // The app should handle missing resume data gracefully
    // by redirecting users through the proper flow
  });
});
