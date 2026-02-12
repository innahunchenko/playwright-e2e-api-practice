
import { test as base, Page } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { FeaturesPage } from './pages/FeaturesPage';

type Fixtures = {
  loginPage: LoginPage;
  featuresPage: FeaturesPage;
  loggedInPage: void;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  featuresPage: async ({ page }, use) => {
    const featuresPage = new FeaturesPage(page);
    await use(featuresPage);
  },

  loggedInPage: async ({ loginPage }, use) => {
    await loginPage.goto();
    await loginPage.verifyPageLoaded();
    await loginPage.login('dev@launchpad.test', 'dev123');
    await loginPage.verifyLoginSuccess();

    await use();
  },
});

export { expect } from '@playwright/test';