import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, Phone, Mail, MapPin, User, Building, MessageCircle, IndianRupee, X, Edit2, Save } from 'lucide-react'
import { customerService } from '../services/customerService.js'

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    location: '',
    status: 'Active',
    value: '',
    joinDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const data = await customerService.fetchCustomers()
      setCustomers(data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const newCustomer = await customerService.insertCustomer(formData)
      setCustomers([newCustomer, ...customers])
      setShowAddForm(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        status: 'Active',
        value: '',
        joinDate: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error adding customer:', error)
    }
  }

  const handleEdit = (customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      location: customer.location,
      status: customer.status,
      value: customer.value,
      joinDate: customer.joinDate,
      notes: customer.notes || ''
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const updatedCustomer = await customerService.updateCustomer(selectedCustomer.id, formData)
      setCustomers(customers.map(customer => 
        customer.id === selectedCustomer.id ? { ...customer, ...formData } : customer
      ))
      setShowEditForm(false)
      setSelectedCustomer(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        status: 'Active',
        value: '',
        joinDate: new Date().toISOString().split('T')[0],
        notes: ''
      })
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer)
    setShowCustomerModal(true)
  }

  const handleSendWhatsApp = () => {
    if (!selectedCustomer || !selectedCustomer.phone) {
      alert('Customer phone number is required to send WhatsApp message')
      return
    }
    
    if (!whatsappMessage.trim()) {
      alert('Please enter a message to send')
      return
    }
    
    // Clean and format phone number for WhatsApp
    let cleanPhone = selectedCustomer.phone.replace(/[\s\-\(\)]/g, '')
    
    // Handle Indian phone numbers
    if (cleanPhone.startsWith('+91')) {
      cleanPhone = cleanPhone.substring(3)
    } else if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.substring(2)
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1)
    }
    
    // Ensure we have a valid 10-digit number for India
    if (cleanPhone.length !== 10) {
      alert('Invalid phone number format. Please ensure it\'s a valid 10-digit Indian mobile number.')
      return
    }
    
    // Create WhatsApp message
    const message = `Hi ${selectedCustomer.name}! 👋\n\nThank you for being a valued customer. We wanted to reach out regarding your account and see if there's anything we can help with.\n\n${whatsappMessage}\n\nBest regards,\nCustomer Support Team`
    
    // Create WhatsApp URL with Indian country code
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp with message
    window.open(whatsappUrl, '_blank')
    setShowWhatsAppModal(false)
    setWhatsappMessage('')
  }

  const cancelEdit = () => {
    setShowEditForm(false)
    setSelectedCustomer(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      location: '',
      status: 'Active',
      value: '',
      joinDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerService.deleteCustomer(id)
        setCustomers(customers.filter(customer => customer.id !== id))
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Customer
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium mb-4">Add New Customer</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({...formData, value: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Add Customer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
              <Filter size={20} className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No customers found</p>
                      <p className="text-sm mt-1">Add your first customer to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.company}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {customer.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(customer.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 mr-2"
                          title="View Customer Details"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(customer)}
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Edit Customer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleSendWhatsApp()}
                          className="text-green-600 hover:text-green-900 mr-2"
                          title="Send WhatsApp Message"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Customer"
                        >
                          <X size={16} />
                        </button>
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
  )}

  {/* Customer Details Modal */}
  {showCustomerModal && selectedCustomer && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="mr-2 text-blue-600" size={24} />
            Customer Details - {selectedCustomer.name}
          </h2>
          <button onClick={() => setShowCustomerModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Name:</span>
                <span className="text-sm text-gray-900">{selectedCustomer.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Email:</span>
                <span className="text-sm text-gray-900">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Phone:</span>
                <span className="text-sm text-gray-900">{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Company:</span>
                <span className="text-sm text-gray-900">{selectedCustomer.company}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Location:</span>
                <span className="text-sm text-gray-900">{selectedCustomer.location}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Status:</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  selectedCustomer.status === 'Active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedCustomer.status}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-24">Join Date:</span>
                <span className="text-sm text-gray-900">{new Date(selectedCustomer.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Notes</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {selectedCustomer.notes || 'No notes available for this customer.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Edit Customer Form */}
  {showEditForm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Customer</h2>
          <button onClick={cancelEdit}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({...formData, company: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
            <input
              type="date"
              value={formData.joinDate}
              onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
              placeholder="Add notes about this customer..."
            />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Update Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  {/* WhatsApp Integration Modal */}
  {showWhatsAppModal && selectedCustomer && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MessageCircle className="mr-2 text-green-600" size={24} />
            Send WhatsApp Message - {selectedCustomer.name}
          </h2>
          <button onClick={() => setShowWhatsAppModal(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {selectedCustomer.name}</div>
              <div><strong>Email:</strong> {selectedCustomer.email}</div>
              <div><strong>Phone:</strong> {selectedCustomer.phone}</div>
              <div><strong>Company:</strong> {selectedCustomer.company}</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Compose Message</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="4"
                placeholder="Type your message here..."
              />
            </div>
            <button
              onClick={handleSendWhatsApp}
              disabled={!selectedCustomer?.phone || !whatsappMessage.trim()}
              className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                selectedCustomer?.phone && whatsappMessage.trim()
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <MessageCircle size={20} className="mr-2" />
              Send WhatsApp Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
  )
}

export default Customers
