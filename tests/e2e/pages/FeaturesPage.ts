import { Page, expect } from '@playwright/test';
import { FRONTEND_URL } from '../../test.config';

export class FeaturesPage {
readonly featuresNavSel      = '[data-testid="nav-features"], a:has-text("Features")';
readonly featuresTableSel    = '[data-testid="features-table"], table.data-table';
readonly newFeatureBtnSel    = '[data-testid="new-feature-btn"], button:has-text("+ New Feature")';
readonly modalSel            = '[data-testid="feature-modal"], .modal-content';
readonly titleSel            = '[data-testid="feature-title"], #title';
readonly descSel             = '[data-testid="feature-description"], #description';
readonly statusSel           = '[data-testid="feature-status"], #status';
readonly prioritySel         = '[data-testid="feature-priority"], #priority';
readonly saveBtnSel          = '[data-testid="feature-save-btn"], button:has-text("Save")';
readonly deleteBtnSel        = '[data-testid="delete-btn"], button:has-text("Delete")';

  constructor(readonly page: Page) {}

  async navigateTo() {
    await this.page.locator(this.featuresNavSel).click();
    await expect(this.page.locator(this.featuresTableSel)).toBeVisible();
  }

  async createFeature(title: string, description: string, status: string, priority: string) {
    await this.page.locator(this.newFeatureBtnSel).click();
    const modal = this.page.locator(this.modalSel);
    await expect(modal).toBeVisible();

    await expect(this.page.locator(this.titleSel)).toBeVisible();
    await this.page.fill(this.titleSel, title);
    await this.page.fill(this.descSel, description);
    await this.page.selectOption(this.statusSel, status);
    await this.page.selectOption(this.prioritySel, priority);
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(modal).not.toBeVisible();
  }

  async verifyFeatureInList(title: string, status: string, priority: string) {
    const featureRow = this.page.locator(`${this.featuresTableSel} tbody tr`).filter({ hasText: title });
    await expect(featureRow).toBeVisible();
    await expect(featureRow.locator('td').first()).toContainText(title);
    await expect(featureRow.locator('td').nth(1)).toContainText(status);
    await expect(featureRow.locator('td').nth(2)).toContainText(priority);
  }

  async deleteFeature(title: string) {
    const row = this.page.locator(`${this.featuresTableSel} tbody tr`).filter({ hasText: title });
    if (await row.count() > 0) {
      this.page.once('dialog', (dialog) => dialog.accept());
      await row.locator(this.deleteBtnSel).click();
      await expect(row).toHaveCount(0);
    }
  }
}
