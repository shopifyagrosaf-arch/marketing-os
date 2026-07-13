import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('announces the default loading label via role=status', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
  });

  it('announces a custom label', () => {
    render(<Spinner label="Loading brands…" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading brands…');
  });
});
