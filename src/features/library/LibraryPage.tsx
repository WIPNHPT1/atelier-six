import { PageHeader } from '../../app/layout/PageHeader'
import { LearnTabs } from '../../app/layout/LearnTabs'
import { copy } from '../../content/copy.en-GB'

export default function LibraryPage() {
  return (
    <PageHeader title={copy.library.title}>
      <LearnTabs />
    </PageHeader>
  )
}
