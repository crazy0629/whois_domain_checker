import React from 'react'
import type { ContactInfo } from '../types/whois'

const Row: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">{value || 'N/A'}</span>
  </div>
)

const ContactInfoTable: React.FC<{ data: ContactInfo }> = ({ data }) => {
  return (
    <div className="space-y-1">
      <Row label="Registrant Name" value={data.registrantName} />
      <Row label="Technical Contact Name" value={data.technicalContactName} />
      <Row label="Administrative Contact Name" value={data.administrativeContactName} />
      <Row label="Contact Email" value={data.contactEmail} />
    </div>
  )
}

export default ContactInfoTable
