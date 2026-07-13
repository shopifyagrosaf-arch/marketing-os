import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiFetch } from '@/lib/api-client';
import { BrandProvider } from './BrandProvider';
import { BrandSwitcher } from './BrandSwitcher';

jest.mock('@/lib/api-client', () => ({
  apiFetch: jest.fn(),
}));

const mockedApiFetch = apiFetch as jest.Mock;

describe('BrandSwitcher', () => {
  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });

  it('shows a spinner while brands are loading, then the select once loaded', async () => {
    mockedApiFetch.mockResolvedValue([
      { id: 'b1', name: 'Agrosaf Pharmaceuticals', slug: 'agrosaf-pharma' },
      { id: 'b2', name: 'Medizone', slug: 'medizone' },
    ]);

    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading brands…');

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Switch brand' })).toBeInTheDocument();
    });
    expect(screen.getByRole('option', { name: 'Agrosaf Pharmaceuticals' })).toBeInTheDocument();
  });

  it('shows an error alert when loading brands fails', async () => {
    mockedApiFetch.mockRejectedValue(new Error('Failed to load brands.'));

    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load brands.');
  });

  it('shows a message when the user has no assigned brands', async () => {
    mockedApiFetch.mockResolvedValue([]);

    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>,
    );

    expect(await screen.findByText('No brands assigned to your account.')).toBeInTheDocument();
  });

  it('switching the select updates the selection', async () => {
    mockedApiFetch.mockResolvedValue([
      { id: 'b1', name: 'Agrosaf Pharmaceuticals', slug: 'agrosaf-pharma' },
      { id: 'b2', name: 'Medizone', slug: 'medizone' },
    ]);
    const user = userEvent.setup();

    render(
      <BrandProvider>
        <BrandSwitcher />
      </BrandProvider>,
    );

    const select = await screen.findByRole('combobox', { name: 'Switch brand' });
    await user.selectOptions(select, 'Medizone');
    expect((select as HTMLSelectElement).value).toBe('b2');
  });
});
