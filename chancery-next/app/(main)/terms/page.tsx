import { SimpleContent, metadataFor } from '@/components/SimpleContent'

export const revalidate = 3600
export const generateMetadata = () => metadataFor('terms')
export default function Page() { return <SimpleContent kind="terms" /> }
