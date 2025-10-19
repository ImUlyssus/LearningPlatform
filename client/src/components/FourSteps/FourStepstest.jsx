// // src/components/FourSteps/FourSteps.test.jsx
// import { render, screen } from '@testing-library/react';
// import FourSteps from './FourSteps';

// describe('FourSteps Component', () => {
//   test('renders the main heading', () => {
//     render(<FourSteps />);
//     expect(
//       screen.getByRole('heading', { name: /Upskill yourself with the following 4 simple steps/i })
//     ).toBeInTheDocument();
//   });

//   test('renders all four steps with their titles and descriptions', () => {
//     render(<FourSteps />);

//     expect(screen.getByRole('heading', { name: '1. Register' })).toBeInTheDocument();
//     expect(screen.getByText('Register your interested course(s)')).toBeInTheDocument();

//     expect(screen.getByRole('heading', { name: '2. Learn' })).toBeInTheDocument();
//     expect(screen.getByText('Learn the course and upgrade your skills')).toBeInTheDocument();

//     expect(screen.getByRole('heading', { name: '3. Take Quiz' })).toBeInTheDocument();
//     expect(screen.getByText('Take quizzes and evaluate your learning')).toBeInTheDocument();

//     expect(screen.getByRole('heading', { name: '4. Get Certificate' })).toBeInTheDocument();
//     expect(screen.getByText('Get certificates and share with others')).toBeInTheDocument();
//   });

//   test('renders exactly 4 step cards', () => {
//     render(<FourSteps />);
//     // H3s are the step titles
//     const stepHeadings = screen.getAllByRole('heading', { level: 3 });
//     expect(stepHeadings).toHaveLength(4);
//   });
// });
