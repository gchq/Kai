import React from 'react';
import { render } from '@testing-library/react';
import App from '../../src/components/App';
import { RestClient } from '../../src/rest/rest-client';

new RestClient('aws-host.com');

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/learn react/i);

  expect(linkElement).toBeInTheDocument();
});
