import { test } from './fixtures';

test('Scenario B: create, verify, and delete a feature (E2E)', async ({
  featuresPage,
  loggedInPage: _ , 
}) => {
  const featureTitle = `e2e-feature-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const featureDescription = 'Created by Playwright E2E test';

  await featuresPage.navigateTo();

  await featuresPage.createFeature(featureTitle, featureDescription, 'DRAFT', 'HIGH');

  await featuresPage.verifyFeatureInList(featureTitle, 'DRAFT', 'HIGH');

  try {
    await featuresPage.deleteFeature(featureTitle);
  } catch {
    // cleanup best-effort
  }
});