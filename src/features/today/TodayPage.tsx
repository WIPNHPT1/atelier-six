import { Navigate } from 'react-router-dom';
import { PageHeader } from '../../app/layout/PageHeader';
import { copy } from '../../content/copy.en-GB';
import { useSettingsStore } from '../../app/settingsStore';

export default function TodayPage() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />;
  }

  return <PageHeader title={copy.today.title} />;
}
