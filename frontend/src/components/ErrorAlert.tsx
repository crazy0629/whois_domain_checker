import React from 'react'

const ErrorAlert: React.FC<{ message: string }> = ({ message }) => {
  if (!message) return null
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  )
}

export default ErrorAlert
