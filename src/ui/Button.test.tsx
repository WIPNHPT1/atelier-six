import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders as a button with its label', () => {
    render(<Button>Play</Button>)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('calls onClick when clicked and activated by keyboard', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Play</Button>)
    const button = screen.getByRole('button', { name: 'Play' })
    await user.click(button)
    button.focus()
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('is disabled and unclickable while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Play
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Play' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
