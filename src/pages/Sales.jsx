import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Filter, Plus } from 'lucide-react'
import SalesChart from '../components/SalesChart.jsx'
import TopProducts from '../components/TopProducts.jsx'
import { salesService } from '../services/salesService.js'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    product: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed'
  })

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const data = await salesService.fetchSales()
      setSales(data)
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newSale = await salesService.insertSale(formData)
      setSales([newSale, ...sales])
      setShowAddForm(false)
      setFormData({
        customer: '',
        product: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      })
    } catch (error) {
      console.error('Error adding sale:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await salesService.deleteSale(id)
        setSales(sales.filter(sale => sale.id !== id))
      } catch (error) {
        console.error('Error deleting sale:', error)
      }
    }
  }

  // Calculate stats from user data
  const totalRevenue = sales.reduce((sum, sale) => {
    const amount = parseFloat(sale.amount?.replace(/[^0-9.-]/g, '')) || 0
    return sum + amount
  }, 0)

  const totalOrders = sales.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const completedSales = sales.filter(sale => sale.status === 'Completed').length

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: totalRevenue > 0 ? '+$' + totalRevenue.toLocaleString() : '+$0',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: totalOrders > 0 ? `+${totalOrders}` : '+0',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Average Order Value',
      value: `$${Math.round(averageOrderValue).toLocaleString()}`,
      change: averageOrderValue > 0 ? `+$${Math.round(averageOrderValue).toLocaleString()}` : '+$0',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Completed Sales',
      value: completedSales.toString(),
      change: completedSales > 0 ? `+${completedSales}` : '+0',
      icon: Users,
      color: 'bg-yellow-500'
    }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }
      return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
          <p className="text-gray-600 mt-2">Track your sales performance and revenue</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Sale
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add New Sale</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({...formData, customer: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <input
                type="text"
                required
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Sale
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp size={16} className="mr-1" />
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Revenue Overview</h2>
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>
          <SalesChart />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Products</h2>
          <TopProducts />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No sales found</p>
                      <p className="text-sm mt-1">Add your first sale to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${parseFloat(sale.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sale.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : sale.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Sales
