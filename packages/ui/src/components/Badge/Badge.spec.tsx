import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders its label and defaults to the neutral tone', () => {
    render(<Badge>DRAFT</Badge>);
    expect(screen.getByText('DRAFT').className).toContain('neutral');
  });

  it('applies the requested tone', () => {
    render(<Badge tone="success">ACTIVE</Badge>);
    expect(screen.getByText('ACTIVE').className).toContain('success');
  });
});
