import React from 'react'
import type { DomainInfo } from '../types/whois'

const Row: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm text-gray-900">{value || 'N/A'}</span>
  </div>
)

const DomainInfoTable: React.FC<{ data: DomainInfo }> = ({ data }) => {
  return (
    <div className="space-y-1">
      <Row label="Domain Name" value={data.domainName} />
      <Row label="Registrar" value={data.registrar} />
      <Row label="Registration Date" value={data.registrationDate} />
      <Row label="Expiration Date" value={data.expirationDate} />
      <Row label="Estimated Domain Age" value={data.estimatedDomainAge} />
      <Row label="Hostnames" value={data.hostnames} />
    </div>
  )
}

export default DomainInfoTable
