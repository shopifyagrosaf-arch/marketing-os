import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children and defaults to a primary, type=button element', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button.className).toContain('primary');
  });

  it('applies the requested variant', () => {
    render(<Button variant="danger">Delete</Button>);
    expect(screen.getByRole('button', { name: 'Delete' }).className).toContain('danger');
  });

  it('fires onClick when enabled, not when disabled', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const { rerender } = render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button onClick={onClick} disabled>
        Click me
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
