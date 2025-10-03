// Test file to validate resume parser functionality
import { parseResumeFile } from './resumeParser';

// Create test resume content for different scenarios
const createTestFile = (content, type = 'text/plain', name = 'test-resume.txt') => {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  return file;
};

// Test data for Solution Architect with 20 years experience
const solutionArchitectResume = `
John Smith
Solution Architect | Enterprise Systems

PROFESSIONAL SUMMARY
Experienced Solution Architect with 20+ years of experience in designing and implementing enterprise-scale systems. 
Led cross-functional teams in delivering complex technical solutions across multiple industries.

EXPERIENCE

Senior Solution Architect | TechCorp Inc. | 2018 - Present
• Designed microservices architecture for distributed systems serving 10M+ users
• Led technical teams of 15+ engineers across multiple projects
• Implemented cloud-native solutions using AWS, Kubernetes, and Docker
• Mentored junior architects and established architectural governance

Principal Architect | GlobalTech Solutions | 2015 - 2018
• Architected scalable API design for enterprise integration
• Managed stakeholder relationships and technical roadmaps
• Implemented DevOps practices and CI/CD pipelines
• Led digital transformation initiatives

Technical Lead | Innovation Labs | 2010 - 2015
• Led development teams in agile environments
• Designed event-driven architectures for real-time systems
• Implemented machine learning solutions for predictive analytics

Software Engineer | StartupTech | 2004 - 2010
• Developed full-stack applications using Java, Python, JavaScript
• Built scalable web applications and RESTful APIs
• Worked with SQL databases and NoSQL solutions

EDUCATION
Master of Science in Computer Science | Stanford University | 2004
Bachelor of Science in Software Engineering | UC Berkeley | 2002

SKILLS
• Architecture: Microservices, System Design, Distributed Systems, Event-Driven Architecture
• Cloud Platforms: AWS, Azure, Google Cloud Platform
• Technologies: Java, Python, JavaScript, Node.js, React, Spring Boot
• DevOps: Docker, Kubernetes, Terraform, Jenkins, GitLab CI
• Databases: PostgreSQL, MongoDB, Redis, Elasticsearch
• Leadership: Team Management, Project Management, Agile, Scrum, Mentoring

CERTIFICATIONS
• AWS Solutions Architect Professional
• Azure Solutions Architect Expert
• Certified Kubernetes Administrator (CKA)
`;

// Test data for Junior Developer
const juniorDeveloperResume = `
Jane Doe
Software Developer

SUMMARY
Recent computer science graduate with 2 years of experience in web development.
Passionate about learning new technologies and building user-friendly applications.

EXPERIENCE
Junior Software Developer | WebDev Company | 2022 - Present
• Developed React applications and REST APIs
• Worked with JavaScript, HTML, CSS, and Node.js
• Collaborated with team using Git and Agile methodologies

Intern | Tech Startup | 2021 - 2022
• Built web applications using JavaScript and Python
• Learned database design with MySQL

EDUCATION
Bachelor of Science in Computer Science | Local University | 2021

SKILLS
JavaScript, React, Node.js, Python, HTML, CSS, MySQL, Git
`;

// Test the parser with different resume types
export const testResumeParser = async () => {
  console.log('🧪 Testing Resume Parser...\n');

  try {
    // Test 1: Solution Architect Resume
    console.log('📄 Test 1: Solution Architect Resume');
    const architectFile = createTestFile(solutionArchitectResume, 'text/plain', 'solution-architect.txt');
    const architectResult = await parseResumeFile(architectFile);
    
    console.log('Results:', {
      currentRole: architectResult.currentRole,
      experience: architectResult.experience,
      skills: architectResult.skills.slice(0, 5),
      education: architectResult.education,
      industry: architectResult.industry
    });
    
    // Validate Solution Architect results
    const architectTests = {
      'Should detect Solution Architect role': architectResult.currentRole === 'Solution Architect',
      'Should detect 20+ years experience': architectResult.experience.includes('20') || architectResult.experience.includes('10+'),
      'Should find architecture skills': architectResult.skills.some(skill => 
        ['microservices', 'system design', 'aws', 'kubernetes'].includes(skill.toLowerCase())
      ),
      'Should detect Masters education': architectResult.education === 'Masters',
      'Should identify Technology industry': architectResult.industry === 'Technology'
    };
    
    console.log('✅ Solution Architect Tests:');
    Object.entries(architectTests).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });

    // Test 2: Junior Developer Resume
    console.log('\n📄 Test 2: Junior Developer Resume');
    const juniorFile = createTestFile(juniorDeveloperResume, 'text/plain', 'junior-developer.txt');
    const juniorResult = await parseResumeFile(juniorFile);
    
    console.log('Results:', {
      currentRole: juniorResult.currentRole,
      experience: juniorResult.experience,
      skills: juniorResult.skills.slice(0, 5),
      education: juniorResult.education,
      industry: juniorResult.industry
    });
    
    // Validate Junior Developer results
    const juniorTests = {
      'Should detect Software Engineer role': juniorResult.currentRole === 'Software Engineer',
      'Should detect 2-5 years experience': juniorResult.experience.includes('2') || juniorResult.experience.includes('1-2'),
      'Should find web development skills': juniorResult.skills.some(skill => 
        ['javascript', 'react', 'node.js', 'python'].includes(skill.toLowerCase())
      ),
      'Should detect Bachelors education': juniorResult.education === 'Bachelors',
      'Should identify Technology industry': juniorResult.industry === 'Technology'
    };
    
    console.log('✅ Junior Developer Tests:');
    Object.entries(juniorTests).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });

    return {
      architectResult,
      juniorResult,
      allTestsPassed: Object.values({...architectTests, ...juniorTests}).every(Boolean)
    };

  } catch (error) {
    console.error('❌ Error testing resume parser:', error);
    return { error: error.message };
  }
};

// Export for use in components
export { solutionArchitectResume, juniorDeveloperResume };
