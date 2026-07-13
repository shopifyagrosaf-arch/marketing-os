import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';

describe('Alert', () => {
  it('defaults error tone to role="alert" (so screen readers announce it immediately)', () => {
    render(<Alert tone="error">Something went wrong.</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong.');
  });

  it('uses role="status" for non-error tones', () => {
    render(<Alert tone="success">Saved.</Alert>);
    expect(screen.getByRole('status')).toHaveTextContent('Saved.');
  });

  it('lets the caller override the role explicitly', () => {
    render(
      <Alert tone="info" role="note">
        FYI
      </Alert>,
    );
    expect(screen.getByRole('note')).toBeInTheDocument();
  });
});
