import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { API_URL, DEFAULT_DESCRIPTION, DEFAULT_STATUS, DEFAULT_PRIORITY } from '../test.config';

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
}

export class FeaturesApi {
  constructor(private request: APIRequestContext, private token?: string) {}

  // Return headers with Authorization if token exists
  private authHeader(): { [key: string]: string } | undefined {
    return this.token ? { Authorization: `Bearer ${this.token}` } : undefined;
  }

  // Create a new feature
  async create(
    title: string,
    description = DEFAULT_DESCRIPTION,
    status = DEFAULT_STATUS,
    priority = DEFAULT_PRIORITY
  ): Promise<APIResponse> {
    return this.request.post(`${API_URL}/features`, {
      headers: this.authHeader(),
      data: { title, description, status, priority },
    });
  }

  // Get a feature by ID
  async get(id: string): Promise<APIResponse> {
    return this.request.get(`${API_URL}/features/${id}`, {
      headers: this.authHeader(),
    });
  }

  // Delete a feature by ID
  async delete(id: string): Promise<APIResponse> {
    return this.request.delete(`${API_URL}/features/${id}`, {
      headers: this.authHeader(),
    });
  }

  // Create a feature without authentication (for 401 check)
  async createWithoutAuth(title: string): Promise<APIResponse> {
    return this.request.post(`${API_URL}/features`, {
      data: {
        title,
        description: DEFAULT_DESCRIPTION,
        status: DEFAULT_STATUS,
        priority: DEFAULT_PRIORITY,
      },
    });
  }

  /**
   * Wait until a feature is deleted.
   * Accepts status 200, 204, or 404 as successful deletion.
   */
  async waitForDeleted(id: string) {
    await expect.poll(
      async () => {
        const res = await this.delete(id);
        console.log(`Delete attempt for feature ${id}: status=${res.status()}`);
        return [200, 204, 404].includes(res.status());
      },
      {
        timeout: 5000,
        intervals: [0, 500, 500, 500, 500, 500],
      }
    ).toBe(true);
  }
}
