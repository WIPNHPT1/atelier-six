import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSettingsStore } from '../../app/settingsStore';
import OnboardingPage from './OnboardingPage';

// The nav's "Start" link and the app's root both land here: a first-time visitor sees the
// onboarding wizard; someone who's already been through it goes straight to Today instead of
// seeing the wizard again. /onboarding itself (e.g. "Restart onboarding" in Settings) always
// shows the wizard regardless of completion, since re-running it deliberately is the point.
//
// Read once on mount, not reactively: OnboardingPage's own finish() flips
// onboardingComplete to true as part of navigating itself away to a lesson (a lazy-loaded
// chunk, so the navigation can take a while on a slow connection) — a reactive read here
// would redirect to /today the instant the flag changes, stranding the user there instead
// of on the lesson they just finished onboarding for. A real navigation elsewhere and back
// always remounts this component, so it re-reads the current value each time it matters.
export default function StartPage() {
  const [onboardingComplete] = useState(() => useSettingsStore.getState().onboardingComplete);
  if (onboardingComplete) return <Navigate to="/today" replace />;
  return <OnboardingPage />;
}
