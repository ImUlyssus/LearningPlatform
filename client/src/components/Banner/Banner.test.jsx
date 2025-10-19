// src/components/Banner/Banner.test.jsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Banner from './Banner';

// Mock the asset as a default export (Vite-style)
vi.mock('../../assets/banner-image.png', () => ({ default: 'mock-banner-image.png' }));

describe('Banner Component', () => {
    test('renders the main heading correctly', () => {
        render(<Banner />); // Allow flexible whitespace in the heading
        expect(screen.getByRole('heading', { name: /Master\s+New Skills\s+Anytime,\s*Anywhere!/i })).toBeInTheDocument();
    });

    test('renders the descriptive paragraph', () => {
        render(<Banner />);
        expect(screen.getByText(/Join a thriving community of learners and achieve your goals/i)).toBeInTheDocument();
    });

    test('renders the "Courses" statistic (number + label)', () => {
        render(<Banner />);
        const label = screen.getByText('Courses');
        const container = label.parentElement;
        expect(container).not.toBeNull();
        // Corrected regex: Matches one or more digits, optionally followed by a plus sign, surrounded by optional whitespace.
        expect(within(container).getByText(/^\s*\d+\+?\s*$/)).toBeInTheDocument();
    });

    test('renders the "Learners" statistic (number + label)', () => {
        render(<Banner />);
        const label = screen.getByText('Learners');
        const container = label.parentElement;
        expect(container).not.toBeNull();
        // Corrected regex: Matches one or more digits, optionally followed by a plus sign, surrounded by optional whitespace.
        expect(within(container).getByText(/^\s*\d+\+?\s*$/)).toBeInTheDocument();
    });

    test('renders the "Scholarships" statistic (number + label)', () => {
        render(<Banner />);
        const label = screen.getByText('Scholarships');
        const container = label.parentElement;
        expect(container).not.toBeNull();
        // Corrected regex: Matches one or more digits, optionally followed by a plus sign, surrounded by optional whitespace.
        expect(within(container).getByText(/^\s*\d+\+?\s*$/)).toBeInTheDocument();
    });

    test('renders the banner image with correct alt (case-insensitive) and mocked src', () => {
        render(<Banner />);
        const bannerImage = screen.getByAltText(/happy learner/i);
        expect(bannerImage).toBeInTheDocument();
        expect(bannerImage).toHaveAttribute('src', 'mock-banner-image.png');
    });
});
