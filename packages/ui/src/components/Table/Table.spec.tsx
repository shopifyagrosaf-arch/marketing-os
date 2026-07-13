import { render, screen } from '@testing-library/react';
import { Table } from './Table';

describe('Table', () => {
  it('renders a real <table> so screen readers get native table semantics', () => {
    render(
      <Table aria-label="Users">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ada Lovelace</td>
          </tr>
        </tbody>
      </Table>,
    );
    expect(screen.getByRole('table', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });
});
