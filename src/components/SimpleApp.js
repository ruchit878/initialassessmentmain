import React from 'react';

const SimpleApp = () => {
  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: 'Inter, Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#ffffff'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700', 
          color: '#1a1a1a',
          marginBottom: '16px'
        }}>
          Windsurf
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280',
          marginBottom: '32px'
        }}>
          AI-Powered Career Partner
        </p>
        <button style={{
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Get Started
        </button>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '48px'
      }}>
        <div style={{
          padding: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          backgroundColor: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>
            Resume Analysis
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Upload your resume and get AI-powered insights into your career path and potential opportunities.
          </p>
        </div>

        <div style={{
          padding: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          backgroundColor: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>
            Career Recommendations
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Get personalized career path recommendations based on your skills and experience.
          </p>
        </div>

        <div style={{
          padding: '24px',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          backgroundColor: '#ffffff'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '12px' }}>
            AI-Proof Skills
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Discover skills that will remain valuable in an AI-driven future workplace.
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: '48px', 
        padding: '32px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '16px' }}>
          Ready to Transform Your Career?
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '24px' }}>
          Join thousands of professionals who have discovered their AI-proof career path.
        </p>
        <button style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '14px 28px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Start Your Analysis
        </button>
      </div>
    </div>
  );
};

export default SimpleApp;
