import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signup, login, ApiError } from './api.js';

const okBase = () => ({ json: async () => ({ id: 1, username: 'jon' }) });

describe('api', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://test-api';
  });
  afterEach(() => vi.unstubAllGlobals());

  it('signup resolves the created user', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ...okBase(), status: 201 })),
    );
    await expect(signup('jon')).resolves.toEqual({ id: 1, username: 'jon' });
  });

  it('signup maps 409 to a friendly ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ...okBase(), status: 409, json: async () => ({ error: 'username taken' }) })),
    );
    await expect(signup('jon')).rejects.toThrow('That username is already taken.');
  });

  it('login maps 404 to a friendly ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ...okBase(), status: 404, json: async () => ({ error: 'no such user' }) })),
    );
    await expect(login('nobody')).rejects.toThrow('No account with that username.');
  });

  it('surfaces the server message for unexpected errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ...okBase(), status: 500, json: async () => ({ error: 'boom' }) })),
    );
    await expect(signup('jon')).rejects.toBeInstanceOf(ApiError);
  });
});
