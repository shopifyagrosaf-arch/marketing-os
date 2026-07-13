import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title and optional description/action', () => {
    render(
      <EmptyState
        title="No content requests yet"
        description="Create one to get started."
        action={<button>New request</button>}
      />,
    );
    expect(screen.getByText('No content requests yet')).toBeInTheDocument();
    expect(screen.getByText('Create one to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New request' })).toBeInTheDocument();
  });
});
