import { useLocation, useNavigate } from 'react-router-dom'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { copy } from '../../content/copy.en-GB'

const segments = [
  { value: '/course', label: copy.learn.course },
  { value: '/library', label: copy.learn.chords },
]

export function LearnTabs() {
  const navigate = useNavigate()
  const location = useLocation()
  const value = location.pathname.startsWith('/library') ? '/library' : '/course'

  return (
    <SegmentedControl
      label={copy.nav.learn}
      segments={segments}
      value={value}
      onChange={(next) => {
        void navigate(next)
      }}
    />
  )
}
