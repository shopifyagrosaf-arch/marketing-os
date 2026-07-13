import { render, screen } from '@testing-library/react';
import { Checkbox, FormField, TextInput } from './FormField';

describe('FormField', () => {
  it('associates the label with the control via htmlFor/id', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <TextInput id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders the hint when there is no error', () => {
    render(
      <FormField label="Slug" htmlFor="slug" hint="Lowercase, hyphens only">
        <TextInput id="slug" />
      </FormField>,
    );
    expect(screen.getByText('Lowercase, hyphens only')).toBeInTheDocument();
  });

  it('renders the error instead of the hint, as an alert', () => {
    render(
      <FormField label="Slug" htmlFor="slug" hint="Lowercase, hyphens only" error="Slug is taken.">
        <TextInput id="slug" />
      </FormField>,
    );
    expect(screen.queryByText('Lowercase, hyphens only')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Slug is taken.');
  });
});

describe('Checkbox', () => {
  it('associates its visible label with the input', () => {
    render(<Checkbox label="content:approve" />);
    expect(screen.getByLabelText('content:approve')).toBeInTheDocument();
  });
});
