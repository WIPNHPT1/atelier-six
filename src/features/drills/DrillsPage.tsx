import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import { useMetronome } from '../../audio/useMetronome';
import { MetronomeControl } from '../../ui/MetronomeControl/MetronomeControl';

export default function DrillsPage() {
  const metronome = useMetronome();
  return (
    <PageHeader title={copy.drills.title}>
      <MetronomeControl {...metronome} />
    </PageHeader>
  );
}
