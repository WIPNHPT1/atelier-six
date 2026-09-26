import { Navigate } from 'react-router-dom';
import { useSettingsStore } from '../../app/settingsStore';
import OnboardingPage from './OnboardingPage';

// The nav's "Start" link and the app's root both land here: a first-time visitor sees the
// onboarding wizard; someone who's already been through it goes straight to Today instead of
// seeing the wizard again. /onboarding itself (e.g. "Restart onboarding" in Settings) always
// shows the wizard regardless of completion, since re-running it deliberately is the point.
export default function StartPage() {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  if (onboardingComplete) return <Navigate to="/today" replace />;
  return <OnboardingPage />;
}
