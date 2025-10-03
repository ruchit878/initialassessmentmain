import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LandingPage from '../LandingPage';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  test('renders landing page with correct title', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    expect(screen.getByText('ElephantScale')).toBeInTheDocument();
    expect(screen.getByText('Your AI-Powered')).toBeInTheDocument();
    expect(screen.getByText('Career Partner')).toBeInTheDocument();
  });

  test('displays main value proposition', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    expect(screen.getByText(/Discover personalized, AI-proof career paths/)).toBeInTheDocument();
  });

  test('shows LinkedIn login buttons', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    const loginButtons = screen.getAllByText(/Continue with LinkedIn/);
    expect(loginButtons).toHaveLength(2); // One in hero, one in CTA
  });

  test('displays features section', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    expect(screen.getByText('AI-Proof Career Paths')).toBeInTheDocument();
    expect(screen.getByText('Data-Driven Insights')).toBeInTheDocument();
    expect(screen.getByText('Psychometric Assessment')).toBeInTheDocument();
  });

  test('shows how it works section', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    expect(screen.getByText('How ElephantScale Works')).toBeInTheDocument();
    expect(screen.getByText('Upload Resume')).toBeInTheDocument();
    expect(screen.getByText('Choose Analysis')).toBeInTheDocument();
    expect(screen.getByText('Get Report')).toBeInTheDocument();
  });

  test('handles LinkedIn login click', () => {
    const mockSetUser = jest.fn();
    renderWithRouter(<LandingPage user={null} setUser={mockSetUser} />);
    
    const loginButton = screen.getAllByText(/Continue with LinkedIn/)[0];
    fireEvent.click(loginButton);
    
    expect(mockSetUser).toHaveBeenCalledWith({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      profilePicture: 'https://via.placeholder.com/150',
      linkedinId: 'johndoe123'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('navigation links work correctly', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    
    const featuresLink = screen.getByText('Features');
    const howItWorksLink = screen.getByText('How It Works');
    const aboutLink = screen.getByText('About');
    
    expect(featuresLink).toHaveAttribute('href', '#features');
    expect(howItWorksLink).toHaveAttribute('href', '#how-it-works');
    expect(aboutLink).toHaveAttribute('href', '#about');
  });

  test('displays footer information', () => {
    renderWithRouter(<LandingPage user={null} setUser={jest.fn()} />);
    expect(screen.getByText('© 2025 ElephantScale. All rights reserved.')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Career Partner')).toBeInTheDocument();
  });
});
