import React from 'react'

const Dashboard = ({ user }) => {
  return (
    <div>
      <h1>Dashboard</h1>
      {user && (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <p>Your role: {user.role}</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard