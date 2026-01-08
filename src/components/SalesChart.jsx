import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SalesChart = () => {
  const data = [
    { month: 'Jan', sales: 4000, leads: 240 },
    { month: 'Feb', sales: 3000, leads: 139 },
    { month: 'Mar', sales: 5000, leads: 380 },
    { month: 'Apr', sales: 4780, leads: 390 },
    { month: 'May', sales: 5890, leads: 480 },
    { month: 'Jun', sales: 6390, leads: 520 },
  ]

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="sales" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Sales ($)"
          />
          <Line 
            type="monotone" 
            dataKey="leads" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Leads"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default SalesChart
