import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(<Button>Click me</Button>)
    const button = getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary')
  })

  it('applies variant classes correctly', () => {
    const { getByRole } = render(<Button variant="destructive">Delete</Button>)
    const button = getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('applies size classes correctly', () => {
    const { getByRole } = render(<Button size="lg">Large Button</Button>)
    const button = getByRole('button', { name: /large button/i })
    expect(button).toHaveClass('h-11')
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>)
    const button = getByRole('button', { name: /click me/i })
    
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled Button</Button>)
    const button = getByRole('button', { name: /disabled button/i })
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50')
  })

  it('renders as child component when asChild is true', () => {
    const { getByRole } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('combines custom className with variant classes', () => {
    const { getByRole } = render(<Button className="custom-class" variant="outline">Custom</Button>)
    const button = getByRole('button', { name: /custom/i })
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('border')
  })
})