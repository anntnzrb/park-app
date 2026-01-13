import { expect, test } from '@playwright/test'

const pad = (value: number) => value.toString().padStart(2, '0')

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  return `${year}-${month}-${day}`
}

test('map shows parking inventory', async ({ page }) => {
  await page.goto('/map')

  await expect(page.getByRole('heading', { name: 'Nearby parking inventory' })).toBeVisible()

  const reserveLinks = page.getByRole('link', { name: 'Reserve' })
  await expect(reserveLinks.first()).toBeVisible()
})

test('driver can sign up, add vehicle, and reserve a spot', async ({ page }) => {
  const uniqueId = Date.now()
  const email = `e2e.driver.${uniqueId}@park-app.demo`
  const password = 'Password123!'
  const plate = `E2E-${uniqueId.toString().slice(-4)}`

  await page.goto('/signup')
  await page.getByLabel('Full name').fill('E2E Driver')
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText('Account created.')).toBeVisible()

  await page.goto('/profile')
  await page.getByPlaceholder('Plate').fill(plate)
  await page.getByRole('button', { name: 'Add vehicle' }).click()
  await expect(page.getByText('Vehicle added')).toBeVisible()

  await page.goto('/map')
  await page.getByRole('link', { name: 'Reserve' }).first().click()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  await page.getByLabel('Arrival date').fill(formatLocalDate(tomorrow))
  await page.getByLabel('Arrival time').fill('09:30')

  await page.getByLabel('Vehicle').selectOption(plate)
  await page.getByRole('button', { name: 'Confirm reservation' }).click()

  await expect(page.getByText('Reservation confirmed.')).toBeVisible()

  await page.goto('/reservations')
  await expect(page.getByText(/Reservation PARK-/)).toBeVisible()
  await expect(page.getByText(`Vehicle: ${plate}`)).toBeVisible()
})
