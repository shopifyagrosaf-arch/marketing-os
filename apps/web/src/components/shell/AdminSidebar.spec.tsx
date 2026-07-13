import { render, screen } from '@testing-library/react';
import { AdminSidebar } from './AdminSidebar';

describe('AdminSidebar', () => {
  it('renders a link to every admin section plus the page content', () => {
    render(
      <AdminSidebar>
        <p>Overview content</p>
      </AdminSidebar>,
    );

    ['Overview', 'Users', 'Roles', 'Permissions', 'Brands', 'Organization'].forEach((label) => {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    });
    expect(screen.getByText('Overview content')).toBeInTheDocument();
  });
});
