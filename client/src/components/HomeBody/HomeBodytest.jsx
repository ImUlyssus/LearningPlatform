// // src/components/HomeBody/HomeBody.test.jsx
// import { render, screen } from '@testing-library/react';
// import HomeBody from './HomeBody';

// // Mock asset as default export
// vi.mock('../../assets/online-learning.png', () => ({ default: 'mock-online-learning.png' }));

// // Mock WEBSITE_NAME constant
// vi.mock('../../constants', () => ({
//   WEBSITE_NAME: 'MockWebsite',
// }));

// describe('HomeBody Component', () => {
//   test('renders "Why MockWebsite?" section heading', () => {
//     render(<HomeBody />);
//     expect(screen.getByRole('heading', { name: /Why MockWebsite\?/i })).toBeInTheDocument();
//   });

//   test('renders the benefit list items', () => {
//     render(<HomeBody />);
//     expect(
//       screen.getByText(/Learn from experts with courses priced up to 10× more affordable/i)
//     ).toBeInTheDocument();
//     expect(
//       screen.getByText(/Quality over quantity — every course is carefully designed/i)
//     ).toBeInTheDocument();
//     expect(
//       screen.getByText(/Share your success with instant certificate links/i)
//     ).toBeInTheDocument();
//   });

//   test('renders the "Why online learning?" section and description', () => {
//     render(<HomeBody />);
//     expect(screen.getByRole('heading', { name: /Why online learning\?/i })).toBeInTheDocument();
//     expect(
//       screen.getByText(/Online learning gives you the flexibility to study anytime, anywhere/i)
//     ).toBeInTheDocument();
//   });

//   test('renders the online learning image with correct alt and mocked src', () => {
//     render(<HomeBody />);
//     const img = screen.getByAltText('Student Learning');
//     expect(img).toBeInTheDocument();
//     expect(img).toHaveAttribute('src', 'mock-online-learning.png');
//   });
// });
