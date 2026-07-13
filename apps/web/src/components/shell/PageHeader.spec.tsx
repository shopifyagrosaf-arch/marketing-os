import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders the title as a heading', () => {
    render(<PageHeader title="Users" />);
    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
  });

  it('renders an optional description and actions', () => {
    render(
      <PageHeader
        title="Users"
        description="Pre-provision and manage accounts."
        actions={<button>Invite user</button>}
      />,
    );
    expect(screen.getByText('Pre-provision and manage accounts.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Invite user' })).toBeInTheDocument();
  });
});
