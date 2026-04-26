import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Add an assertion based on what's actually in your App.
    // Assuming there's some text or element. We just want to ensure it mounts.
    expect(document.body).toBeInTheDocument();
  });
});
