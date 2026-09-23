import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Heading } from './Heading'

describe('Heading', () => {
  it('renders as an h1 by default', () => {
    render(<Heading>Today</Heading>)
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('renders the requested level', () => {
    render(<Heading level={3}>Section</Heading>)
    expect(screen.getByRole('heading', { level: 3, name: 'Section' })).toBeInTheDocument()
  })
})
