import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders Atelier Six', () => {
    render(<App />)
    expect(screen.getByText('Atelier Six')).toBeInTheDocument()
  })
})
