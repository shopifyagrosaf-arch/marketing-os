import { serverApiFetch } from '@/lib/server-api';

interface UsersPage {
  total: number;
}
interface Role {
  id: string;
}
interface Brand {
  id: string;
}

export default async function AdminOverviewPage() {
  const [usersPage, roles, brands] = await Promise.all([
    serverApiFetch<UsersPage>('users?limit=1'),
    serverApiFetch<Role[]>('roles'),
    serverApiFetch<Brand[]>('brands'),
  ]);

  return (
    <div>
      <h1>Admin Overview</h1>
      <ul>
        <li>Users: {usersPage?.total ?? '—'}</li>
        <li>Roles: {roles?.length ?? '—'}</li>
        <li>Brands: {brands?.length ?? '—'}</li>
      </ul>
    </div>
  );
}
