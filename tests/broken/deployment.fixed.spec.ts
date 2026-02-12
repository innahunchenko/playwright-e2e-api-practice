import { test, expect, APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3001';
const TEST_ADMIN_EMAIL = 'admin@launchpad.test';
const TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'admin123';

interface Release {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  status: string;
}

const DEPLOY_STATUS = { SUCCESS: 'SUCCESS' } as const;

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

async function getAuthToken(request: APIRequestContext): Promise<string> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return body.accessToken;
}

async function createRelease(
  request: APIRequestContext,
  token: string,
  name: string
): Promise<Release> {
  const response = await request.post(`${API_URL}/releases`, {
    headers: authHeaders(token),
    data: {
      name,
      description: 'Test deployment',
      targetDate: new Date().toISOString(),
    },
  });
  expect(response.ok()).toBeTruthy();
  return response.json();
}

async function deployRelease(
  request: APIRequestContext,
  token: string,
  releaseId: string
) {
  const response = await request.post(`${API_URL}/releases/${releaseId}/deploy`, {
    headers: authHeaders(token),
  });
  expect(response.status()).toBe(201);
  return response;
}

async function waitForDeploymentSuccess(
  request: APIRequestContext,
  token: string,
  releaseId: string
) {
  await expect.poll(
    async () => {
      const statusResponse = await request.get(`${API_URL}/releases/${releaseId}`, {
        headers: authHeaders(token),
      });
      if (!statusResponse.ok()) {
        return `HTTP_${statusResponse.status()}`;
      }
      const updatedRelease: Release = await statusResponse.json();
      return updatedRelease.status;
    },
    {
      timeout: 15_000,
      intervals: [1000, 2000, 3000],
    }
  ).toBe(DEPLOY_STATUS.SUCCESS);
}

test.describe('Deployment Flow', () => {
  let authToken: string;
  let createdReleases: string[] = [];

  test.beforeEach(async ({ request }) => {
    authToken = await getAuthToken(request);
    createdReleases = [];
  });

  test.afterEach(async ({ request }) => {
    for (const releaseId of createdReleases) {
      try {
        await request.delete(`${API_URL}/releases/${releaseId}`, {
          headers: authHeaders(authToken),
        });
      } catch (err) {
        console.warn(`Cleanup failed for release ${releaseId}:`, err);
      }
    }
  });

  test('should create a release and deploy it', async ({ request }) => {
    const release = await createRelease(request, authToken, 'Test Release v1.0.0');
    createdReleases.push(release.id);

    expect(release.name).toBe('Test Release v1.0.0');

    await deployRelease(request, authToken, release.id);
    await waitForDeploymentSuccess(request, authToken, release.id);
  });

  test('should not allow concurrent deployments', async ({ request }) => {
    test.fail(true, 'Known backend bug: concurrent deployments are allowed');

    const release = await createRelease(request, authToken, 'Concurrent Test Release');
    createdReleases.push(release.id);

    const [res1, res2] = await Promise.all([
      request.post(`${API_URL}/releases/${release.id}/deploy`, {
        headers: authHeaders(authToken),
      }),
      request.post(`${API_URL}/releases/${release.id}/deploy`, {
        headers: authHeaders(authToken),
      }),
    ]);

    const successCount = [res1, res2].filter(r => r.ok()).length;
    expect(successCount).toBe(1);
  });
});
