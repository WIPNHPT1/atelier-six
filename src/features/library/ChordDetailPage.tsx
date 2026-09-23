import { useParams } from 'react-router-dom'
import { PageHeader } from '../../app/layout/PageHeader'
import { copy } from '../../content/copy.en-GB'

export default function ChordDetailPage() {
  const { chord } = useParams<{ chord: string }>()
  return <PageHeader title={chord ?? copy.library.title} breadcrumb={copy.library.title} />
}
