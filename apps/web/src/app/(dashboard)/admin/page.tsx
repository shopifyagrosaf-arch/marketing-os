import { Card } from '@agrosaf/ui';
import { serverApiFetch } from '@/lib/server-api';
import { PageHeader } from '@/components/shell/PageHeader';

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

  const stats = [
    { label: 'Users', value: usersPage?.total ?? '—' },
    { label: 'Roles', value: roles?.length ?? '—' },
    { label: 'Brands', value: brands?.length ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Admin Overview" />
      <div style={{ display: 'flex', gap: '1rem' }}>
        {stats.map((stat) => (
          <Card key={stat.label} style={{ minWidth: 140 }}>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{stat.value}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
