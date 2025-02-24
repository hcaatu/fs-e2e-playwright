const { test, describe, beforeEach, expect } = require('@playwright/test')
const { loginWith, createBlog } = require('./utility')
const exp = require('constants')

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

  describe('removing the blog', () => {
    test('is succesful if the user added the blog', async ({ page }) => {
      await loginWith(page, 'admin', '141414')
      page.on('dialog', dialog => dialog.accept());
      await createBlog(page, 'Type wars', 'Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
      await page.getByRole('button', { name: 'view' }).click()
      await page.getByRole('button', { name: 'remove' }).click()

      await expect(page.getByText('Type wars Robert C. Martin')).not.toBeVisible()
    })

    test('fails if the logged in user did not add the blog', async ({ request, page }) => {
      await request.post('/api/users', {
        data: {
          username: 'kissa',
          password: 'koira',
          name: 'toinen käyttäjä'
        }
      })
      await loginWith(page, 'kissa', 'koira')
      await createBlog(page, 'Type wars', 'Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'admin', '141414')
      await page.getByRole('button', { name: 'view' }).click()

      await expect(page.getByRole('button', { name: 'remove' })).not.toBeVisible()
    })
  })

  test('blogs are sorted according to likes', async ({ page }) => {
    await loginWith(page, 'admin', '141414')
    await createBlog(page, 'Type wars', 'Robert C. Martin', 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html')
    await page.getByRole('button', { name: 'view' }).click()
    await createBlog(page, 'React patterns', 'Michael Chan', 'https://reactpatterns.com/')
    await page.getByRole('button', { name: 'view' }).click()
    await createBlog(page, 'Canonical string reduction', 'Edsger W. Dijkstra', 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html')
    await page.getByRole('button', { name: 'view' }).click()

    await expect(page.getByText('created a new blog titled Canonical string reduction')).toBeVisible()
    
    // likes the blogs a specified amount of times
    let likeCount = 1
    while (likeCount > 0) {
      await page.getByTestId('Type wars likes').click()
      likeCount--
    }
    likeCount = 4
    while (likeCount > 0) {
      await page.getByTestId('React patterns likes').click()
      likeCount--
    }
    likeCount = 2
    while (likeCount > 0) {
      await page.getByTestId('Canonical string reduction likes').click()
      likeCount--
    }

    await expect(page.getByText('likes 4')).toBeVisible()

    // checks that the blogs are in correct order
    const blogs = await page.locator('.blog').all()
    await expect(blogs[0]).toHaveText(/React patterns Michael Chan/)
    await expect(blogs[1]).toHaveText(/Canonical string reduction Edsger W. Dijkstra/)
    await expect(blogs[2]).toHaveText(/Type wars Robert C. Martin/)
    })
})
