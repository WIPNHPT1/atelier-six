import { useParams } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import { useMetronome } from '../../audio/useMetronome';
import { MetronomeControl } from '../../ui/MetronomeControl/MetronomeControl';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const metronome = useMetronome();
  return (
    <PageHeader title={id ?? copy.lesson.title}>
      <MetronomeControl {...metronome} />
    </PageHeader>
  );
}
