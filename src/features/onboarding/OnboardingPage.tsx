import { PageHeader } from '../../app/layout/PageHeader'
import { copy } from '../../content/copy.en-GB'
import { Logo } from '../../ui/Logo'

export default function OnboardingPage() {
  return (
    <PageHeader title={copy.onboarding.title}>
      <Logo variant="mark" size={64} />
    </PageHeader>
  )
}
