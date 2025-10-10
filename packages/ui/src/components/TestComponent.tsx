import React from 'react'

export interface TestComponentProps {
  message?: string
}

export const TestComponent: React.FC<TestComponentProps> = ({ 
  message = "Hello from UI package!" 
}) => {
  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid blue', 
      borderRadius: '8px',
      margin: '10px'
    }}>
      <h3>Test Component</h3>
      <p>{message}</p>
    </div>
  )
}