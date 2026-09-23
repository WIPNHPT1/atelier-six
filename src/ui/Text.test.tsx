import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text', () => {
  it('renders its children', () => {
    render(<Text>Keep finger 1 where it is.</Text>)
    expect(screen.getByText('Keep finger 1 where it is.')).toBeInTheDocument()
  })

  it('applies the dim style for secondary text', () => {
    render(<Text dim data-testid="text">Dim</Text>)
    expect(screen.getByTestId('text').className).toMatch(/dim/)
  })
})
