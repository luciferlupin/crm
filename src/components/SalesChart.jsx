import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { salesService } from '../services/salesService.js'
import { leadService } from '../services/leadService.js'

const SalesChart = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      
      // Fetch real sales and leads data
      const [sales, leads] = await Promise.all([
        salesService.fetchSales(),
        leadService.fetchLeads()
      ])
      
      // Group data by month
      const monthlyData = {}
      
      // Process sales data
      sales.forEach(sale => {
        if (sale.date) {
          const date = new Date(sale.date)
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: date.toLocaleDateString('en-US', { month: 'short' }),
              sales: 0,
              leads: 0,
              fullMonth: monthKey
            }
          }
          
          monthlyData[monthKey].sales += parseFloat(sale.amount) || 0
        }
      })
      
      // Process leads data
      leads.forEach(lead => {
        if (lead.created_at) {
          const date = new Date(lead.created_at)
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              month: date.toLocaleDateString('en-US', { month: 'short' }),
              sales: 0,
              leads: 0,
              fullMonth: monthKey
            }
          }
          
          monthlyData[monthKey].leads += 1
        }
      })
      
      // Convert to array and sort by date
      const sortedData = Object.values(monthlyData)
        .sort((a, b) => new Date(a.fullMonth) - new Date(b.fullMonth))
        .slice(-6) // Show last 6 months
        .map(item => ({
          month: item.month,
          sales: Math.round(item.sales),
          leads: item.leads
        }))
      
      // If no data, show empty chart with current months
      if (sortedData.length === 0) {
        const currentMonth = new Date()
        const months = []
        for (let i = 5; i >= 0; i--) {
          const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
          months.push({
            month: month.toLocaleDateString('en-US', { month: 'short' }),
            sales: 0,
            leads: 0
          })
        }
        setData(months)
      } else {
        setData(sortedData)
      }
      
    } catch (error) {
      console.error('Error fetching chart data:', error)
      // Show empty chart on error
      const currentMonth = new Date()
      const months = []
      for (let i = 5; i >= 0; i--) {
        const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1)
        months.push({
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          sales: 0,
          leads: 0
        })
      }
      setData(months)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

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
            name="Sales (₹)"
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
