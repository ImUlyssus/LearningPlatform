// // src/components/HomeSections/HomeSections.test.jsx
// import React from 'react';
// import { render, screen } from '@testing-library/react';

// // Mock child components so we can unit-test HomeSections in isolation
// vi.mock('../CourseCard/CourseCard', () => ({
//   default: ({ image, title, duration, description, price }) => (
//     <div data-testid="course-card">
//       <img alt={`${title} thumbnail`} src={image} />
//       <h3>{title}</h3>
//       <span>{duration}</span>
//       <span>{price}</span>
//       <p>{description}</p>
//     </div>
//   ),
// }));

// vi.mock('./FAQItem', () => ({
//   default: ({ question, answer }) => (
//     <div data-testid="faq-item">
//       <dt>{question}</dt>
//       <dd>{answer}</dd>
//     </div>
//   ),
// }));

// // Mock image assets as default exports (Vite treats assets as default-exported URLs)
// vi.mock('../../assets/mission.png', () => ({ default: 'mock-mission.png' }));
// vi.mock('../../assets/vision.png', () => ({ default: 'mock-vision.png' }));
// vi.mock('../../assets/values.png', () => ({ default: 'mock-values.png' }));

// import HomeSections from './HomeSections';

// describe('HomeSections', () => {
//   test('renders "Our Top Courses" section and description', () => {
//     render(<HomeSections />);

//     expect(
//       screen.getByRole('heading', { name: /Our Top Courses/i })
//     ).toBeInTheDocument();

//     expect(
//       screen.getByText(/Discover the courses everyone's talking about/i)
//     ).toBeInTheDocument();
//   });

//   test('renders three CourseCard items with correct titles', () => {
//     render(<HomeSections />);

//     const cards = screen.getAllByTestId('course-card');
//     expect(cards).toHaveLength(3);

//     // Titles from the component's topCourses array
//     expect(screen.getByText('Data Science')).toBeInTheDocument();
//     expect(screen.getByText('Software Engineer')).toBeInTheDocument();
//     expect(screen.getByText('Machine Learning')).toBeInTheDocument();
//   });

//   test('renders the "Explore All Courses" button', () => {
//     render(<HomeSections />);
//     expect(
//       screen.getByRole('button', { name: /Explore All Courses/i })
//     ).toBeInTheDocument();
//   });

//   test('renders "Our Mission, Vision & Values" section with headings', () => {
//     render(<HomeSections />);

//     expect(
//       screen.getByRole('heading', { name: /Our Mission, Vision & Values/i })
//     ).toBeInTheDocument();

//     expect(screen.getByRole('heading', { name: 'MISSION', level: 3 })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: 'VISION', level: 3 })).toBeInTheDocument();
//     expect(screen.getByRole('heading', { name: 'VALUES', level: 3 })).toBeInTheDocument();
//   });

//   test('renders 3 icons with correct mocked src (Mission, Vision, Values)', () => {
//     render(<HomeSections />);

//     // All three use alt="Mission Icon" in the component
//     const icons = screen.getAllByAltText('Mission Icon');
//     expect(icons).toHaveLength(3);

//     // Order in DOM: Mission, Vision, Values
//     expect(icons[0]).toHaveAttribute('src', 'mock-mission.png');
//     expect(icons[1]).toHaveAttribute('src', 'mock-vision.png');
//     expect(icons[2]).toHaveAttribute('src', 'mock-values.png');
//   });

//   test('renders "Frequently Asked Questions" section and all FAQ items', () => {
//     render(<HomeSections />);

//     expect(
//       screen.getByRole('heading', { name: /Frequently Asked Questions/i })
//     ).toBeInTheDocument();

//     const faqs = screen.getAllByTestId('faq-item');
//     expect(faqs).toHaveLength(6);

//     // Spot-check a couple of questions
//     expect(
//       screen.getByText(/How do I sign up for a course\?/i)
//     ).toBeInTheDocument();

//     expect(
//       screen.getByText(/Can I access courses on mobile devices\?/i)
//     ).toBeInTheDocument();
//   });
// });
