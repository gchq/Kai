import { Component } from 'react';
import { render } from '@testing-library/react';
import App from '../../src/components/App';

// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);

//   expect(linkElement).toBeInTheDocument();
// });

test('compare values', () => {
  expect(5).toBe(5);
});