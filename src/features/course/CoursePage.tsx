import { PageHeader } from '../../app/layout/PageHeader'
import { LearnTabs } from '../../app/layout/LearnTabs'
import { copy } from '../../content/copy.en-GB'

export default function CoursePage() {
  return (
    <PageHeader title={copy.course.title}>
      <LearnTabs />
    </PageHeader>
  )
}
