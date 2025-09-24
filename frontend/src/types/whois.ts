export type WhoisDataType = 'domain' | 'contact'

export interface DomainInfo {
  domainName: string
  registrar: string
  registrationDate: string
  expirationDate: string
  estimatedDomainAge: string
  hostnames: string
}

export interface ContactInfo {
  registrantName: string
  technicalContactName: string
  administrativeContactName: string
  contactEmail: string
}

export interface WhoisError {
  error: string
}
