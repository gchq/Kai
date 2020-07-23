import { Component } from 'react';
import { render } from '@testing-library/react';
import App from '../../src/components/App';
import { idText } from 'typescript';

// test('renders learn react link', () => {
//   const { getByText } = render(<App />);
//   const linkElement = getByText(/learn react/i);

//   expect(linkElement).toBeInTheDocument();
// });

describe('App tests', ()=>{
  it('compare values', () => {
    expect(5).toBe(5);
  });
});
