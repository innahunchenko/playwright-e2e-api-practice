import { Page, expect } from '@playwright/test';
import { FRONTEND_URL } from '../../test.config';

export class LoginPage {
readonly emailSel      = '[data-testid="login-email"], #email';
readonly passwordSel   = '[data-testid="login-password"], #password';
readonly loginBtnSel   = '[data-testid="login-btn"], button:has-text("Login")';
readonly headingSel    = '[data-testid="login-heading"], h1';

  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto(`${FRONTEND_URL}/login`);
  }

  async verifyPageLoaded() {
    await expect(this.page.locator(this.headingSel)).toHaveText(/Launchpad/i);
    await expect(this.page.locator(this.emailSel)).toBeVisible();
    await expect(this.page.locator(this.passwordSel)).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.page.fill(this.emailSel, email);
    await this.page.fill(this.passwordSel, password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async verifyLoginSuccess() {
    await expect(this.page).toHaveURL(new RegExp(`${FRONTEND_URL}/(features)?$`));
  }
}
