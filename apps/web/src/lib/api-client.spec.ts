import { apiFetch } from './api-client';

describe('apiFetch', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('calls the same-origin proxy route, not the API directly', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'brand1' }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await apiFetch('brands/mine', { brandId: 'brand1' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/proxy/brands/mine',
      expect.objectContaining({
        headers: expect.objectContaining({ 'x-brand-id': 'brand1' }),
      }),
    );
  });

  it('throws with the server-provided message on a non-ok response', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ message: 'You do not have access to this brand.' }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await expect(apiFetch('brands/x')).rejects.toThrow(
      'You do not have access to this brand.',
    );
  });
});
