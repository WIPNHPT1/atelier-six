import { useParams } from 'react-router-dom'
import { PageHeader } from '../../app/layout/PageHeader'
import { copy } from '../../content/copy.en-GB'

export default function LessonPage() {
  const { id } = useParams<{ id: string }>()
  return <PageHeader title={id ?? copy.lesson.title} />
}
