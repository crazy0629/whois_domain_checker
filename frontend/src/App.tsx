import React from 'react'
import { WhoisProvider, useWhois } from './context/WhoisContext'
import Header from './components/Header'
import Footer from './components/Footer'
import DomainForm from './components/DomainForm'
import DomainInfoTable from './components/DomainInfoTable'
import ContactInfoTable from './components/ContactInfoTable'
import ErrorAlert from './components/ErrorAlert'

const Content: React.FC = () => {
  const { domainInfo, contactInfo, error } = useWhois()
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                WHOIS Domain Checker
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Get instant access to comprehensive domain registration information,
                ownership details, and technical data for any domain name.
              </p>
            </div>

            <DomainForm />
          </div>
        </div>

        {/* Results Section */}
        <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-8">
              <ErrorAlert message={error.error} />
            </div>
          )}

          <div className="flex justify-center">
            <div className="w-full max-w-4xl space-y-8">
              {domainInfo && contactInfo && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        Domain Information
                      </h2>
                    </div>
                    <div className="p-6">
                      <DomainInfoTable data={domainInfo} />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        Contact Information
                      </h2>
                    </div>
                    <div className="p-6">
                      <ContactInfoTable data={contactInfo} />
                    </div>
                  </div>
                </div>
              )}

              {domainInfo && !contactInfo && (
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                          </div>
                          Domain Information
                        </h2>
                      </div>
                      <div className="p-6">
                        <DomainInfoTable data={domainInfo} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!domainInfo && contactInfo && (
                <div className="flex justify-center">
                  <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          Contact Information
                        </h2>
                      </div>
                      <div className="p-6">
                        <ContactInfoTable data={contactInfo} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Features Section - Only show when no results */}
          {!domainInfo && !contactInfo && !error && (
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Our WHOIS Checker?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Get the most accurate and comprehensive domain information available
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                  <p className="text-gray-600">Get instant domain information in seconds with our optimized infrastructure</p>
                </div>

                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">100% Accurate</h3>
                  <p className="text-gray-600">Real-time data directly from authoritative registrars and databases</p>
                </div>

                <div className="text-center p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Comprehensive</h3>
                  <p className="text-gray-600">Complete domain details including registration, contact, and technical information</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

const App: React.FC = () => (
  <WhoisProvider>
    <Content />
  </WhoisProvider>
)

export default App
