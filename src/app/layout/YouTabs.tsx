import { useLocation, useNavigate } from 'react-router-dom';
import { copy } from '../../content/copy.en-GB';
import { SegmentedControl } from '../../ui/SegmentedControl';

const segments = [
  { value: '/progress', label: copy.you.progress },
  { value: '/settings', label: copy.you.settings },
];

export function YouTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const value = location.pathname.startsWith('/settings') ? '/settings' : '/progress';
  return (
    <SegmentedControl
      label={copy.you.tabs}
      segments={segments}
      value={value}
      onChange={(next) => {
        void navigate(next);
      }}
    />
  );
}
