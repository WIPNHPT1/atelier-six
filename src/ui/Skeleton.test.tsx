import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders a decorative, hidden-from-a11y placeholder', () => {
    render(<Skeleton data-testid="skeleton" width={120} height={16} />)
    const el = screen.getByTestId('skeleton')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveStyle({ width: '120px', height: '16px' })
  })
})
