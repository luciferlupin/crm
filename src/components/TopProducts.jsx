import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { salesService } from '../services/salesService.js'

const TopProducts = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    try {
      setLoading(true)
      
      // Fetch real sales data
      const sales = await salesService.fetchSales()
      
      // Group sales by product
      const productData = {}
      
      sales.forEach(sale => {
        if (sale.product && sale.status === 'Completed') {
          const product = sale.product
          const amount = parseFloat(sale.amount) || 0
          
          if (!productData[product]) {
            productData[product] = {
              name: product,
              sales: 0,
              units: 0
            }
          }
          
          productData[product].sales += amount
          productData[product].units += 1
        }
      })
      
      // Convert to array and sort by sales (highest first)
      const sortedData = Object.values(productData)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5) // Show top 5 products
      
      // If no data, show empty state
      if (sortedData.length === 0) {
        setData([
          { name: 'No products', sales: 0, units: 0 }
        ])
      } else {
        setData(sortedData)
      }
      
    } catch (error) {
      console.error('Error fetching top products:', error)
      // Show empty state on error
      setData([
        { name: 'No products', sales: 0, units: 0 }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (data.length === 0 || (data.length === 1 && data[0].name === 'No products')) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-sm">No products sold yet</p>
          <p className="text-xs mt-1">Add sales to see top products</p>
        </div>
      </div>
    )
  }

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
              if (name === 'sales') return [`₹${value.toLocaleString('en-IN')}`, 'Revenue']
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
