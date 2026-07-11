import { signIn } from '@/lib/auth';

/**
 * SSO-only login (Google Workspace / Microsoft 365 per SRS v2 A7) — there is
 * intentionally no email/password form; this platform has no local
 * credential store.
 */
export default function LoginPage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: 280 }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Agrosaf Marketing OS</h1>

        <form
          action={async () => {
            'use server';
            await signIn('google');
          }}
        >
          <button type="submit" style={{ width: '100%' }}>
            Continue with Google Workspace
          </button>
        </form>

        <form
          action={async () => {
            'use server';
            await signIn('microsoft-entra-id');
          }}
        >
          <button type="submit" style={{ width: '100%' }}>
            Continue with Microsoft 365
          </button>
        </form>
      </div>
    </main>
  );
}
