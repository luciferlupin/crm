import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const TopProducts = () => {
  const data = [
    { name: 'Enterprise', sales: 45000, units: 15 },
    { name: 'Professional', sales: 32000, units: 28 },
    { name: 'Starter', sales: 18000, units: 45 },
    { name: 'Custom', sales: 25000, units: 8 },
    { name: 'Add-on', sales: 12000, units: 32 },
  ]

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            dataKey="name"
            type="category"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}
            formatter={(value, name) => {
              if (name === 'sales') return [`$${value.toLocaleString()}`, 'Revenue']
              return [value, 'Units Sold']
            }}
          />
          <Bar 
            dataKey="sales" 
            fill="#3b82f6" 
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TopProducts
