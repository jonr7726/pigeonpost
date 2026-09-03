const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface User {
  id: number;
  username: string;
}

export async function signup(username: string): Promise<User> {
  return postJson('/api/users/signup', username, 201);
}

export async function login(username: string): Promise<User> {
  return postJson('/api/users/login', username, 200);
}

async function postJson(path: string, username: string, created: number): Promise<User> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  const body = (await res.json().catch(() => null)) as { error?: string } | null;
  if (res.status === created) {
    return body as unknown as User;
  }
  if (res.status === 409) {
    throw new ApiError('That username is already taken.');
  }
  if (res.status === 404) {
    throw new ApiError('No account with that username.');
  }
  throw new ApiError(body?.error ?? 'Something went wrong. Try again.');
}

export class ApiError extends Error {}
