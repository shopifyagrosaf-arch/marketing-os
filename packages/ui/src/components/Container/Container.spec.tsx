import { render, screen } from '@testing-library/react';
import { Container } from './Container';

describe('Container', () => {
  it('renders its children', () => {
    render(<Container>Page content</Container>);
    expect(screen.getByText('Page content')).toBeInTheDocument();
  });
});
