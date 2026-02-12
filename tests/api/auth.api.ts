import { APIRequestContext } from '@playwright/test';
import { API_URL } from '../test.config';

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async login(email: string, password: string): Promise<string> {
    const res = await this.request.post(`${API_URL}/auth/login`, {
      data: { email, password },
    });
    const json = await res.json() as any;
    return json.accessToken || json.token || json.access_token;
  }
}
