import { EmailInfo } from '../../services/emails'

interface EmailTableRowProps {
  email: EmailInfo
}

export default function EmailTableRow(props: EmailTableRowProps) {
  return (
    <div className="flex-1 max-h-screen overflow-scroll md:p-8">{/*  */}</div>
  )
}
