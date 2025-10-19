// src/components/CourseCard/CourseCard.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import CourseCard from './CourseCard';

const renderCourse = (overrides = {}) => {
  const props = {
    image: 'https://example.com/course.jpg',
    title: 'Sample Course',
    duration: '4 Hours',
    description:
      'This is a sample course description that explains what you will learn.',
    price: 'MMK30,000',
    ...overrides,
  };
  render(<CourseCard {...props} />);
  return props;
};

describe('CourseCard', () => {
  test('renders image with correct alt and src', () => {
    const props = renderCourse();
    const img = screen.getByRole('img', { name: props.title });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', props.image);
    expect(img).toHaveAttribute('alt', props.title);
  });

  test('renders title as a heading', () => {
    const props = renderCourse();
    // Title is in an h3
    expect(
      screen.getByRole('heading', { level: 3, name: props.title })
    ).toBeInTheDocument();
  });

  test('renders duration, description, and price', () => {
    const props = renderCourse({
      duration: '6 Hours',
      price: 'MMK50,000',
      description: 'Learn at your own pace with hands-on examples.',
    });

    expect(screen.getByText('6 Hours')).toBeInTheDocument();
    expect(
      screen.getByText(/Learn at your own pace with hands-on examples\./i)
    ).toBeInTheDocument();
    expect(screen.getByText('MMK50,000')).toBeInTheDocument();
  });

  test('renders the "Read more" button', () => {
    renderCourse();
    const button = screen.getByRole('button', { name: /read more/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test.each([
    {
      image: 'https://example.com/ds.jpg',
      title: 'Data Science',
      duration: '4 Hours',
      price: 'MMK30,000',
      description:
        'Master data analysis, machine learning, and statistical modeling.',
    },
    {
      image: 'https://example.com/se.jpg',
      title: 'Software Engineering',
      duration: '8 Hours',
      price: 'MMK45,000',
      description: 'Build scalable applications from front-end to back-end.',
    },
  ])('supports different props: %s', (p) => {
    render(<CourseCard {...p} />);
    // Title heading
    expect(
      screen.getByRole('heading', { level: 3, name: p.title })
    ).toBeInTheDocument();

    // Image with alt=title and correct src
    const img = screen.getByRole('img', { name: p.title });
    expect(img).toHaveAttribute('src', p.image);

    // Duration, description, price
    expect(screen.getByText(p.duration)).toBeInTheDocument();
    expect(screen.getByText(p.price)).toBeInTheDocument();
    // Use a substring for description to avoid failures on small text differences
    const snippet = p.description.slice(0, 25);
    expect(screen.getByText(new RegExp(snippet, 'i'))).toBeInTheDocument();

    // Button
    expect(screen.getByRole('button', { name: /read more/i })).toBeInTheDocument();
  });
});
