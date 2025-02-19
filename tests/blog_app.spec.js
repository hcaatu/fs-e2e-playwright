const { test, describe, beforeEach, expect } = require('@playwright/test')
const { loginWith, createBlog } = require('./utility')

describe('blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Super user',
        username: 'admin',
        password: '141414'
      }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'username'} )).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'password'} )).toBeVisible()
    await expect(page.getByRole('button', { name: 'login'} )).toBeVisible()
  })

  describe('Login', () => {
    test('is successful with correct credentials', async ({ page }) => {
      await loginWith(page, 'admin', '141414')
      await expect(page.getByText('Super user logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'not admin', '252525')
      await expect(page.getByText('Wrong username or password')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach( async ({ page }) => {
      await loginWith(page, 'admin', '141414')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'Type wars', 'Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
      await expect(page.getByText('created a new blog titled Type wars')).toBeVisible()
      await expect(page.getByTestId('Type wars')).toBeVisible()
    })

    test('a blog can be liked', async ({ page }) => {
      await createBlog(page, 'Type wars', 'Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'like' }).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })
  })
})
