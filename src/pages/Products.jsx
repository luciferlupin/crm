import React, { useState, useEffect } from 'react'
import { Package, TrendingUp, IndianRupee, Users, Star, BarChart3, Filter, Search } from 'lucide-react'
import { salesService } from '../services/salesService.js'

const Products = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('revenue')

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

  // Analyze product data from sales
  const analyzeProducts = () => {
    const productMap = new Map()
    
    sales.filter(sale => sale.status === 'Completed').forEach(sale => {
      const productName = sale.product
      const amount = parseFloat(sale.amount) || 0
      
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          name: productName,
          totalRevenue: 0,
          unitsSold: 0,
          customers: new Set(),
          sales: []
        })
      }
      
      const product = productMap.get(productName)
      product.totalRevenue += amount
      product.unitsSold += 1
      product.customers.add(sale.customer)
      product.sales.push(sale)
    })
    
    return Array.from(productMap.values()).map(product => ({
      ...product,
      averagePrice: product.unitsSold > 0 ? product.totalRevenue / product.unitsSold : 0,
      customerCount: product.customers.size,
      customerSatisfaction: Math.random() * 2 + 3 // Mock satisfaction score (3-5)
    }))
  }

  const products = analyzeProducts()

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.totalRevenue - a.totalRevenue
      case 'units':
        return b.unitsSold - a.unitsSold
      case 'customers':
        return b.customerCount - a.customerCount
      case 'satisfaction':
        return b.customerSatisfaction - a.customerSatisfaction
      default:
        return 0
    }
  })

  // Filter products based on search
  const filteredProducts = sortedProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate overall stats
  const totalProducts = products.length
  const totalProductRevenue = products.reduce((sum, product) => sum + product.totalRevenue, 0)
  const topProduct = products.length > 0 ? products.reduce((max, product) => 
    product.totalRevenue > max.totalRevenue ? product : max
  ) : null

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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Analytics</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Track product performance and customer preferences</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg">
              <Package className="text-white" size={18} />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-blue-600">
              <TrendingUp size={14} className="mr-1" />
              +{totalProducts}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{totalProducts}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Products</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg">
              <IndianRupee className="text-white" size={18} />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-green-600">
              <TrendingUp size={14} className="mr-1" />
              +₹{totalProductRevenue.toLocaleString('en-IN')}
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">₹{totalProductRevenue.toLocaleString('en-IN')}</h3>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Total Product Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg">
              <BarChart3 className="text-white" size={18} />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-purple-600">
              <TrendingUp size={14} className="mr-1" />
              Best
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
            {topProduct ? topProduct.name : 'N/A'}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Top Product</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="bg-yellow-500 p-2 sm:p-3 rounded-lg">
              <Star className="text-white" size={18} />
            </div>
            <div className="flex items-center text-xs sm:text-sm text-yellow-600">
              <TrendingUp size={14} className="mr-1" />
              High
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
            {products.length > 0 ? (products.reduce((sum, p) => sum + p.customerSatisfaction, 0) / products.length).toFixed(1) : '0'}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Avg Satisfaction</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          >
            <option value="revenue">Sort by Revenue</option>
            <option value="units">Sort by Units Sold</option>
            <option value="customers">Sort by Customers</option>
            <option value="satisfaction">Sort by Satisfaction</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Product Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customers
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-8 sm:py-12 text-center">
                    <div className="text-gray-500">
                      <Package className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
                      <p className="text-sm sm:text-base">No products found</p>
                      <p className="text-xs sm:text-sm mt-1">Products will appear here once you make sales</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
                          <Package className="text-primary-600" size={16} />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{product.name}</div>
                          <div className="text-xs text-gray-500">Product #{index + 1}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        ₹{product.totalRevenue.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((product.totalRevenue / totalProductRevenue) * 100).toFixed(1)}% of total
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{product.unitsSold}</div>
                      <div className="text-xs text-gray-500">units sold</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">
                        ₹{product.averagePrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">avg price</div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users size={12} className="mr-1 sm:mr-2 text-gray-400" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{product.customerCount}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center mr-1 sm:mr-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i < Math.floor(product.customerSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {product.customerSatisfaction.toFixed(1)}
                        </span>
                      </div>
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

export default Products
