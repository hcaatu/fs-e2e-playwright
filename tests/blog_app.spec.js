const { test, describe, beforeEach, expect } = require('@playwright/test')

describe('blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'superuser',
        username: 'koira',
        password: 'kissa'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'username'} )).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'password'} )).toBeVisible()
    await expect(page.getByRole('button', { name: 'login'} )).toBeVisible()
  })
})