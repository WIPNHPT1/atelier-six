import { useParams } from 'react-router-dom'
import { PageHeader } from '../../app/layout/PageHeader'
import { copy } from '../../content/copy.en-GB'

export default function CourseModulePage() {
  const { module } = useParams<{ module: string }>()
  return <PageHeader title={module ?? copy.course.title} breadcrumb={copy.course.title} />
}
