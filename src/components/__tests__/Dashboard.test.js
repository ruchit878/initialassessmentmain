import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Dashboard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profilePicture: 'https://via.placeholder.com/150',
    linkedinId: 'johndoe123'
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders dashboard with user name', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  test('displays Windsurf branding', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    expect(screen.getByText('Windsurf')).toBeInTheDocument();
  });

  test('shows start analysis section', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    expect(screen.getByText('Start Your Career Analysis')).toBeInTheDocument();
    expect(screen.getByText('Upload your resume to begin your personalized career path analysis.')).toBeInTheDocument();
  });

  test('upload resume button navigates correctly', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    const uploadButton = screen.getByText('Upload Resume');
    fireEvent.click(uploadButton);
    expect(mockNavigate).toHaveBeenCalledWith('/upload');
  });

  test('logout button navigates to home', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('redirects to home when no user', () => {
    renderWithRouter(<Dashboard user={null} />);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('displays career analysis prompt', () => {
    renderWithRouter(<Dashboard user={mockUser} />);
    expect(screen.getByText('Ready to discover your AI-proof career path?')).toBeInTheDocument();
  });
});
