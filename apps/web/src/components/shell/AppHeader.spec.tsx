import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

jest.mock('@/components/brand-switcher/BrandSwitcher', () => ({
  BrandSwitcher: () => <span>Brand switcher</span>,
}));
jest.mock('@/lib/auth', () => ({
  signOut: jest.fn(),
}));

describe('AppHeader', () => {
  it('shows the Admin link only when isOrgAdmin is true', () => {
    const { rerender } = render(<AppHeader isOrgAdmin={false} />);
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument();

    rerender(<AppHeader isOrgAdmin />);
    expect(screen.getByRole('link', { name: 'Admin' })).toBeInTheDocument();
  });

  it('always shows the Dashboard/Content Requests links, brand switcher, and sign out', () => {
    render(<AppHeader isOrgAdmin={false} />);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Content Requests' })).toBeInTheDocument();
    expect(screen.getByText('Brand switcher')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });
});
