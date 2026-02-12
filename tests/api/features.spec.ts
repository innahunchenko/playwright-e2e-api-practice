import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { AuthApi } from './auth.api';
import { FeaturesApi, Feature } from './features.api';
import { DEFAULT_DESCRIPTION, DEFAULT_STATUS, DEFAULT_PRIORITY } from '../test.config';

test.describe('Features API', () => {
  let token: string;

  // Get auth token once for all tests
  test.beforeAll(async ({ request }) => {
    const authApi = new AuthApi(request);
    token = (await authApi.login('dev@launchpad.test', 'dev123'))!;
  });

  // Test unauthenticated access
  test('should require authentication', async ({ request }) => {
    const featuresApi = new FeaturesApi(request); // no token
    const res = await featuresApi.createWithoutAuth('unauth-feature');
    expect(res.status()).toBe(401);
  });

  // Test create, retrieve and cleanup
  test('should create, retrieve, and delete a feature', async ({ request }) => {
    const featuresApi = new FeaturesApi(request, token);

    const title = `api-feature-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let createdId: string | undefined;

    try {
      // Create feature
      const createRes = await featuresApi.create(title);
      expect(createRes.status()).toBe(201);
      const created = await createRes.json() as Feature;
      createdId = created.id;

      // Retrieve feature
      const getRes = await featuresApi.get(createdId);
      expect(getRes.ok()).toBeTruthy();
      const fetched = await getRes.json() as Feature;

      // Validate feature fields
      expect(fetched.id).toBe(createdId);
      expect(fetched.title).toBe(title);
      expect(fetched.description).toBe(DEFAULT_DESCRIPTION);
      expect(fetched.status).toBe(DEFAULT_STATUS);
      expect(fetched.priority).toBe(DEFAULT_PRIORITY);

    } finally {
      // Cleanup: wait until the feature is deleted
      if (createdId) {
        await featuresApi.waitForDeleted(createdId);
      }
    }
  });
});
