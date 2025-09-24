import React, { createContext, useContext, useState, ReactNode } from 'react'
import { DomainInfo, ContactInfo, WhoisDataType, WhoisError } from '../types/whois'

interface WhoisContextType {
  isLoading: boolean
  domainInfo: DomainInfo | null
  contactInfo: ContactInfo | null
  error: WhoisError | null
  lookupDomain: (domain: string, type: WhoisDataType) => Promise<void>
  clearData: () => void
}

const WhoisContext = createContext<WhoisContextType | undefined>(undefined)

const API_BASE_URL = 'http://localhost:5000/api'

export const WhoisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [error, setError] = useState<WhoisError | null>(null)

  const lookupDomain = async (domain: string, type: WhoisDataType) => {
    setIsLoading(true)
    setError(null)
    setDomainInfo(null)
    setContactInfo(null)

    try {
      const cleanDomain = domain.trim().toLowerCase()
      const response = await fetch(`${API_BASE_URL}/whois/${cleanDomain}?type=${type}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || 'Failed to fetch domain information')
      }

      const data = await response.json()

      if (type === 'domain') {
        setDomainInfo(data)
      } else {
        setContactInfo(data)
      }
    } catch (err) {
      setError({
        error: err instanceof Error ? err.message : 'An unexpected error occurred'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearData = () => {
    setDomainInfo(null)
    setContactInfo(null)
    setError(null)
  }

  return (
    <WhoisContext.Provider value={{
      isLoading,
      domainInfo,
      contactInfo,
      error,
      lookupDomain,
      clearData
    }}>
      {children}
    </WhoisContext.Provider>
  )
}

export const useWhois = () => {
  const context = useContext(WhoisContext)
  if (context === undefined) {
    throw new Error('useWhois must be used within a WhoisProvider')
  }
  return context
}
