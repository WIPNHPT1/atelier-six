import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Panel } from './Panel'

describe('Panel', () => {
  it('renders its children inside a hairline-bordered container', () => {
    render(<Panel>Content</Panel>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('supports a raised variant', () => {
    render(
      <Panel raised data-testid="panel">
        Content
      </Panel>,
    )
    expect(screen.getByTestId('panel').className).toMatch(/raised/)
  })
})
