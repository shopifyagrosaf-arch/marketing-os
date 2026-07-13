import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when everything fits on one page', () => {
    const { container } = render(
      <Pagination page={1} limit={20} total={5} onPageChange={jest.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination page={1} limit={20} total={40} onPageChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('calls onPageChange with the next/previous page number', async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(<Pagination page={2} limit={20} total={60} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
