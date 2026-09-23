import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SegmentedControl } from './SegmentedControl'

const segments = [
  { value: 'course', label: 'Course' },
  { value: 'chords', label: 'Chords' },
]

describe('SegmentedControl', () => {
  it('renders a radiogroup with the selected segment checked', () => {
    render(
      <SegmentedControl label="Learn" segments={segments} value="course" onChange={vi.fn()} />,
    )
    expect(screen.getByRole('radiogroup', { name: 'Learn' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Course' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Chords' })).toHaveAttribute('aria-checked', 'false')
  })

  it('selects a segment via click and arrow keys', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <SegmentedControl label="Learn" segments={segments} value="course" onChange={onChange} />,
    )
    await user.click(screen.getByRole('radio', { name: 'Chords' }))
    expect(onChange).toHaveBeenCalledWith('chords')

    screen.getByRole('radio', { name: 'Course' }).focus()
    await user.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenCalledWith('chords')
  })
})
