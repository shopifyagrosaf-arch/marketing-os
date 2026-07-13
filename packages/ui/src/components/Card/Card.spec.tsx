import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders its children inside the card surface', () => {
    render(<Card>Organization settings</Card>);
    expect(screen.getByText('Organization settings')).toBeInTheDocument();
  });
});
