import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders a labelled slider', () => {
    render(<Slider label="Tempo" value={90} min={40} max={200} onChange={vi.fn()} />)
    expect(screen.getByRole('slider', { name: 'Tempo' })).toBeInTheDocument()
  })

  it('steps by 1 with arrow keys and by 5 with shift+arrow', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Slider label="Tempo" value={90} min={40} max={200} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: 'Tempo' })
    slider.focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith(91)
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}')
    expect(onChange).toHaveBeenLastCalledWith(95)
  })
})
