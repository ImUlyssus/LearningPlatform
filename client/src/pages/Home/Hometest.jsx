// // src/pages/Home/Home.test.jsx
// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import Home from './Home';
// import { WEBSITE_NAME } from '../../constants';

// // Helper to escape regex special chars in WEBSITE_NAME
// const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// describe('Home page (integration)', () => {
//   test('renders all major sections from child components', () => {
//     render(<Home />);

//     // Banner
//     expect(
//       screen.getByRole('heading', { name: /Master\s+New Skills\s+Anytime,\s*Anywhere!/i })
//     ).toBeInTheDocument();

//     // FourSteps
//     expect(
//       screen.getByRole('heading', {
//         name: /Upskill yourself with the following 4 simple steps/i,
//       })
//     ).toBeInTheDocument();

//     // HomeBody: "Why {WEBSITE_NAME}?"
//     const siteNameRegex = new RegExp(`^\\s*Why\\s+${escapeRegExp(WEBSITE_NAME)}\\?\\s*$`, 'i');
//     expect(screen.getByRole('heading', { name: siteNameRegex })).toBeInTheDocument();

//     // HomeBody: "Why online learning?"
//     expect(
//       screen.getByRole('heading', { name: /Why online learning\?/i })
//     ).toBeInTheDocument();

//     // HomeSections: top courses section title and CTA button
//     expect(screen.getByRole('heading', { name: /Our Top Courses/i })).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /Explore All Courses/i })).toBeInTheDocument();

//     // HomeSections: mission/vision/values section
//     expect(
//       screen.getByRole('heading', { name: /Our Mission, Vision & Values/i })
//     ).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: 'MISSION', level: 3 })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: 'VISION', level: 3 })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: 'VALUES', level: 3 })).toBeInTheDocument();

//     // HomeSections: FAQs
//     expect(
//       screen.getByRole('heading', { name: /Frequently Asked Questions/i })
//     ).toBeInTheDocument();

//     // Spot-check FAQ questions
//     expect(screen.getByText(/How do I sign up for a course\?/i)).toBeInTheDocument();
//     expect(screen.getByText(/Can I access courses on mobile devices\?/i)).toBeInTheDocument();
//   });

//   test('renders expected course titles in top courses', () => {
//     render(<Home />);
//     expect(screen.getByText('Data Science')).toBeInTheDocument();
//     expect(screen.getByText('Software Engineer')).toBeInTheDocument();
//     expect(screen.getByText('Machine Learning')).toBeInTheDocument();
//   });

//   test('has at least two "Why ...?" headings on the page', () => {
//     render(<Home />);
//     const whyHeadings = screen.getAllByRole('heading', { name: /Why .*?\?/i });
//     expect(whyHeadings.length).toBeGreaterThanOrEqual(2);
//   });
// });
