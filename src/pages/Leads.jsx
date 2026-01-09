import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, Target, Clock, CheckCircle, XCircle, X, Edit2, Save, Phone, Mail, Building, Calendar, TrendingUp, User, IndianRupee, BarChart3, PieChart, Activity, MessageSquare, Video, Settings, ExternalLink, History, MessageCircle, UserPlus } from 'lucide-react'
import { leadService } from '../services/leadService.js'
import { formatIndianCurrency, parseIndianCurrency, formatIndianCurrencyInput } from '../utils/currency.js'

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showCalendlyModal, setShowCalendlyModal] = useState(false)
  const [showCRMModal, setShowCRMModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappMessage, setWhatsappMessage] = useState('')
  const [activities, setActivities] = useState([])
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    duration: '',
    outcome: ''
  })
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    location: '',
    status: 'new',
    source: 'Website',
    value: '',
    score: 50,
    assigned_to: '',
    notes: '',
    created_date: new Date().toISOString().split('T')[0],
    last_contacted: ''
  })

  // Indian states list
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
    'Lakshadweep', 'Puducherry'
  ]

  // Months list
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Generate years from current year to 10 years back
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - i)

  // Generate days array (1-31)
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Save customer data to localStorage for use in other forms
  const saveCustomerToStorage = (customerData) => {
    const existingCustomers = JSON.parse(localStorage.getItem('crmCustomers') || '[]')
    const customerIndex = existingCustomers.findIndex(c => c.email === customerData.email)
    
    if (customerIndex >= 0) {
      // Update existing customer
      existingCustomers[customerIndex] = customerData
    } else {
      // Add new customer
      existingCustomers.push(customerData)
    }
    
    localStorage.setItem('crmCustomers', JSON.stringify(existingCustomers))
  }

  // Get all customers from storage
  const getAllCustomersFromStorage = () => {
    return JSON.parse(localStorage.getItem('crmCustomers') || '[]')
  }

  // Auto-fill form with existing customer data
  const autoFillFromExistingCustomer = (customerEmail) => {
    const existingCustomers = getAllCustomersFromStorage()
    const customer = existingCustomers.find(c => c.email === customerEmail)
    
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        company: customer.company || '',
        phone: customer.phone || '',
        location: customer.location || '',
        status: 'new',
        source: 'Website',
        value: '', // Don't auto-fill value as it may differ
        score: 50,
        assigned_to: '',
        notes: '',
        created_date: new Date().toISOString().split('T')[0],
        last_contacted: ''
      })
    }
  }

  useEffect(() => {
    fetchLeads()
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLeads()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const data = await leadService.fetchLeads()
      setLeads(data)
    } catch (error) {
      setError('Failed to fetch leads')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddLead = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Name is required')
      return
    }
    
    if (!formData.email.trim()) {
      alert('Email is required')
      return
    }
    
    if (!formData.email.includes('@')) {
      alert('Please enter a valid email address')
      return
    }
    
    try {
      const newLead = await leadService.insertLead(formData)
      setLeads([newLead, ...leads])
      
      // Save customer data to unified storage
      saveCustomerToStorage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        location: formData.location,
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0]
      })
      
      setShowAddForm(false)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        location: '',
        status: 'new',
        source: 'Website',
        value: '',
        score: 50,
        assigned_to: '',
        notes: '',
        created_date: new Date().toISOString().split('T')[0],
        last_contacted: ''
      })
    } catch (error) {
      console.error('Error adding lead:', error)
    }
  }

  const handleEdit = (lead) => {
    setEditingLead(lead.id)
    setFormData({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
      location: lead.location || '',
      status: lead.status,
      source: lead.source,
      value: lead.value,
      score: lead.score,
      assigned_to: lead.assigned_to,
      notes: lead.notes || '',
      created_date: lead.created_date || new Date().toISOString().split('T')[0],
      last_contacted: lead.last_contacted || ''
    })
  }

  const handleUpdate = async (id) => {
    try {
      const previousLead = leads.find(lead => lead.id === id)
      const updatedLead = await leadService.updateLead(id, formData)
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, ...formData } : lead
      ))
      
      // If lead is being converted to "converted" status, create a pending sale
      if (previousLead.status !== 'converted' && formData.status === 'converted') {
        console.log('Converting lead to sale:', previousLead)
        
        // Add conversion date to the lead data
        const conversionDate = new Date().toISOString().split('T')[0]
        const updatedLeadWithConversion = {
          ...formData,
          conversion_date: conversionDate
        }
        
        // Update the lead with conversion date
        await leadService.updateLead(id, updatedLeadWithConversion)
        
        const pendingSale = {
          customer: previousLead.name,
          product: 'Product/Service', // Default product, can be updated later
          amount: previousLead.value || '0', // Use lead value as initial amount
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
        }
        
        console.log('Creating pending sale:', pendingSale)
        
        // Save to sales localStorage
        const existingSales = JSON.parse(localStorage.getItem('crm_sales') || '[]')
        const newSale = {
          id: Date.now().toString(),
          ...pendingSale,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        existingSales.unshift(newSale)
        localStorage.setItem('crm_sales', JSON.stringify(existingSales))
        
        console.log('Saved to localStorage. Total sales:', existingSales.length)
        
        // Show success message
        alert(`Lead "${previousLead.name}" has been converted and added to pending sales!`)
        
        // Trigger a custom event to notify sales page to refresh
        window.dispatchEvent(new CustomEvent('salesDataUpdated', { detail: { sale: newSale } }))
        
        // Update local leads state to include conversion date
        setLeads(leads.map(lead => 
          lead.id === id ? { ...lead, ...updatedLeadWithConversion } : lead
        ))
      }
      
      setEditingLead(null)
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        status: 'new',
        source: 'Website',
        value: '',
        score: 50,
        assigned_to: '',
        notes: '',
        created_date: new Date().toISOString().split('T')[0],
        last_contacted: ''
      })
    } catch (error) {
      console.error('Error updating lead:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(id)
        setLeads(leads.filter(lead => lead.id !== id))
      } catch (error) {
        setError('Failed to delete lead')
        console.error('Error:', error)
      }
    }
  }

  const cancelEdit = () => {
    setEditingLead(null)
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      status: 'new',
      source: 'Website',
      value: '',
      score: 50,
      assigned_to: '',
      notes: '',
      created_date: new Date().toISOString().split('T')[0],
      last_contacted: ''
    })
  }

  const updateLeadStatus = async (id, newStatus) => {
    try {
      await leadService.updateLead(id, { status: newStatus })
      setLeads(leads.map(lead => 
        lead.id === id ? { ...lead, status: newStatus } : lead
      ))
    } catch (error) {
      setError('Failed to update lead status')
      console.error('Error:', error)
    }
  }

  // Analytics calculations
  const calculateAnalytics = () => {
    const statusCounts = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      converted: leads.filter(l => l.status === 'converted').length,
      lost: leads.filter(l => l.status === 'lost').length
    }

    const totalLeads = leads.length
    const conversionFunnel = [
      { stage: 'New', count: statusCounts.new, percentage: totalLeads > 0 ? (statusCounts.new / totalLeads * 100).toFixed(1) : 0 },
      { stage: 'Contacted', count: statusCounts.contacted, percentage: totalLeads > 0 ? (statusCounts.contacted / totalLeads * 100).toFixed(1) : 0 },
      { stage: 'Qualified', count: statusCounts.qualified, percentage: totalLeads > 0 ? (statusCounts.qualified / totalLeads * 100).toFixed(1) : 0 },
      { stage: 'Converted', count: statusCounts.converted, percentage: totalLeads > 0 ? (statusCounts.converted / totalLeads * 100).toFixed(1) : 0 }
    ]

    // Lead source performance
    const sourcePerformance = leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown'
      if (!acc[source]) {
        acc[source] = { total: 0, converted: 0, value: 0 }
      }
      acc[source].total++
      if (lead.status === 'converted') {
        acc[source].converted++
      }
      const value = parseFloat(lead.value?.replace(/[^0-9.-]/g, '')) || 0
      acc[source].value += value
      return acc
    }, {})

    const sourceStats = Object.entries(sourcePerformance).map(([source, data]) => ({
      source,
      total: data.total,
      converted: data.converted,
      conversionRate: data.total > 0 ? (data.converted / data.total * 100).toFixed(1) : 0,
      totalValue: data.value
    })).sort((a, b) => b.conversionRate - a.conversionRate)

    // Time to conversion calculation
    console.log('=== DEBUGGING LEADS DATA ===')
    console.log('Total leads:', leads.length)
    console.log('Leads data:', leads)
    
    const convertedLeads = leads.filter(lead => lead.status === 'converted')
    console.log('Converted leads:', convertedLeads.length)
    console.log('Converted leads data:', convertedLeads)
    
    const timeToConversion = convertedLeads.map(lead => {
      console.log('Processing lead:', lead.name, 'Status:', lead.status)
      console.log('Lead created_date:', lead.created_date)
      console.log('Lead conversion_date:', lead.conversion_date)
      console.log('Lead last_contacted:', lead.last_contacted)
      
      // Try different date fields that might exist
      const created = lead.created_date ? new Date(lead.created_date) : 
                     lead.created_at ? new Date(lead.created_at) : 
                     lead.date ? new Date(lead.date) : 
                     new Date()
      
      console.log('Created date parsed:', created)
      
      // Use conversion_date if available, otherwise estimate with last_contacted
      const convertedDate = lead.conversion_date 
        ? new Date(lead.conversion_date)
        : lead.last_contacted 
          ? new Date(lead.last_contacted)
          : new Date()
      
      console.log('Converted date parsed:', convertedDate)
      
      const timeDiffMs = convertedDate - created
      const timeDiffHours = timeDiffMs / (1000 * 60 * 60)
      const timeDiffDays = timeDiffHours / 24
      
      console.log('Time diff ms:', timeDiffMs)
      console.log('Time diff hours:', timeDiffHours)
      console.log('Time diff days:', timeDiffDays)
      
      const displayText = timeDiffDays >= 1 
        ? `${timeDiffDays.toFixed(1)} days`
        : timeDiffHours >= 1
          ? `${timeDiffHours.toFixed(1)} hours`
          : `${(timeDiffHours * 60).toFixed(0)} minutes`
      
      console.log('Display text:', displayText)
      
      return {
        leadName: lead.name,
        createdDate: created.toLocaleString(),
        convertedDate: convertedDate.toLocaleString(),
        timeDiffMs: timeDiffMs,
        totalHours: timeDiffHours,
        totalDays: timeDiffDays,
        displayText: displayText
      }
    })
    
    const avgTimeToConversion = timeToConversion.length > 0 
      ? timeToConversion.reduce((sum, time) => sum + time.totalHours, 0) / timeToConversion.length
      : 0
    
    console.log('Average hours:', avgTimeToConversion)
    
    // Format average time for display
    let avgTimeDisplay = '0.0 hours'
    if (avgTimeToConversion > 0) {
      if (avgTimeToConversion >= 24) {
        avgTimeDisplay = `${(avgTimeToConversion / 24).toFixed(1)}`
      } else if (avgTimeToConversion >= 1) {
        avgTimeDisplay = `${avgTimeToConversion.toFixed(1)} hours`
      } else {
        avgTimeDisplay = `${(avgTimeToConversion * 60).toFixed(0)} minutes`
      }
    }
    
    console.log('Final avg display:', avgTimeDisplay)
    console.log('===============================')

    return {
      conversionFunnel,
      sourceStats,
      avgTimeToConversion: avgTimeDisplay,
      totalLeads,
      conversionRate: totalLeads > 0 ? (statusCounts.converted / totalLeads * 100).toFixed(1) : 0
    }
  }

  const analytics = calculateAnalytics()

  // Activity Timeline Functions
  const handleAddActivity = async () => {
    if (!selectedLead) return
    
    try {
      const newActivity = {
        id: Date.now(),
        leadId: selectedLead.id,
        ...activityForm,
        createdAt: new Date().toISOString()
      }
      
      setActivities([...activities, newActivity])
      
      // Update last contacted date for the lead
      await leadService.updateLead(selectedLead.id, { 
        last_contacted: new Date().toISOString().split('T')[0] 
      })
      
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, last_contacted: new Date().toISOString().split('T')[0] }
          : lead
      ))
      
      setActivityForm({
        type: 'call',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        duration: '',
        outcome: ''
      })
      setShowActivityModal(false)
    } catch (error) {
      setError('Failed to add activity')
      console.error('Error:', error)
    }
  }

  const handleSendWhatsAppMessage = () => {
    if (!selectedLead || !selectedLead.phone) {
      alert('Phone number is required to send WhatsApp message')
      return
    }
    
    if (!whatsappMessage.trim()) {
      alert('Please enter a message to send')
      return
    }
    
    // Clean and format phone number for WhatsApp
    let cleanPhone = selectedLead.phone.replace(/[\s\-\(\)]/g, '')
    
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
    
    // Create WhatsApp URL with Indian country code
    const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(whatsappMessage)}`
    
    // Open WhatsApp with message
    window.open(whatsappUrl, '_blank')
    setShowWhatsAppModal(false)
    setWhatsappMessage('')
  }

  const setMessageSuggestion = (message) => {
    setWhatsappMessage(message)
  }

  const handleCRMIntegration = async (crmType) => {
    if (!selectedLead) return
    
    try {
      // Mock CRM integration - in real implementation, this would connect to actual CRM APIs
      const crmData = {
        lead: selectedLead,
        activities: activities.filter(a => a.leadId === selectedLead.id),
        crmType,
        timestamp: new Date().toISOString()
      }
      
      console.log(`Syncing lead ${selectedLead.id} to ${crmType}:`, crmData)
      
      // Store integration status
      localStorage.setItem(`crm_sync_${selectedLead.id}_${crmType}`, JSON.stringify({
        synced: true,
        timestamp: crmData.timestamp
      }))
      
      setShowCRMModal(false)
      alert(`Lead successfully synced to ${crmType}!`)
    } catch (error) {
      setError(`Failed to sync to ${crmType}`)
      console.error('Error:', error)
    }
  }

  const getLeadActivities = (leadId) => {
    return activities.filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'call': return <Phone size={16} className="text-blue-500" />
      case 'email': return <Mail size={16} className="text-green-500" />
      case 'meeting': return <Video size={16} className="text-purple-500" />
      case 'note': return <MessageSquare size={16} className="text-yellow-500" />
      default: return <Activity size={16} className="text-gray-500" />
    }
  }

  const getCRMIntegrationStatus = (leadId, crmType) => {
    const syncData = localStorage.getItem(`crm_sync_${leadId}_${crmType}`)
    return syncData ? JSON.parse(syncData) : { synced: false }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || lead.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Target className="text-blue-500" size={16} />
      case 'contacted': return <Clock className="text-yellow-500" size={16} />
      case 'qualified': return <CheckCircle className="text-green-500" size={16} />
      case 'converted': return <CheckCircle className="text-green-600" size={16} />
      case 'lost': return <XCircle className="text-red-500" size={16} />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'contacted': return 'bg-yellow-100 text-yellow-800'
      case 'qualified': return 'bg-green-100 text-green-800'
      case 'converted': return 'bg-green-100 text-green-900'
      case 'lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading leads...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Leads</h1>
          <p className="text-gray-600 mt-2">Track and manage your sales pipeline</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showAnalytics 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart3 size={20} className="mr-2" />
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
            data-add-lead-btn
          >
            <Plus size={20} className="mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {showAnalytics && (
        <div className="mb-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Conversion Funnel */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <BarChart3 size={20} className="mr-2 text-blue-600" />
                Lead Conversion Funnel
              </h2>
              <div className="space-y-4">
                {analytics.conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{stage.count} leads</span>
                        <span className="text-sm font-semibold text-blue-600">{stage.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                        style={{ width: `${stage.percentage}%` }}
                      >
                        {stage.percentage > 10 && (
                          <span className="text-white text-xs font-medium">{stage.percentage}%</span>
                        )}
                      </div>
                    </div>
                    {index < analytics.conversionFunnel.length - 1 && (
                      <div className="flex justify-center mt-2">
                        <div className="text-gray-400">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Source Performance */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <PieChart size={20} className="mr-2 text-green-600" />
                Lead Source Performance
              </h2>
              <div className="space-y-3">
                {analytics.sourceStats.slice(0, 5).map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center flex-1">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-yellow-500' :
                        index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{source.source}</div>
                        <div className="text-xs text-gray-500">{source.total} leads</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{source.conversionRate}%</div>
                      <div className="text-xs text-gray-500">{source.converted} converted</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Lead</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Customer Selection Dropdown */}
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-3">
                <div className="bg-green-600 p-2 rounded-lg mr-3">
                  <UserPlus size={18} className="text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-900">
                    Quick Fill from Existing Customer
                  </label>
                  <p className="text-xs text-green-700 mt-1">Select a customer to auto-fill their information</p>
                </div>
              </div>
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      autoFillFromExistingCustomer(e.target.value)
                    }
                  }}
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors"
                >
                  <option value="">👤 Choose existing customer to auto-fill...</option>
                  {getAllCustomersFromStorage().map((customer, index) => (
                    <option key={index} value={customer.email} className="py-2">
                      {customer.name} • {customer.email} • {customer.company || 'No Company'}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 flex items-center text-xs text-green-700">
                <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                <span>Customers are automatically saved when you add them to any form</span>
              </div>
            </div>
            <form onSubmit={handleAddLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter lead's full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="lead@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+91 98765 43210"
                  pattern="[+]?[0-9]{1,4}?[-\s]?[0-9]{1,4}"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <select
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                  >
                    <option value="">📍 Select a state...</option>
                    {indianStates.map((state, index) => (
                      <option key={index} value={state} className="text-gray-700">
                        {state}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6m0 0l6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IndianRupee size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) => {
                      const formatted = formatIndianCurrencyInput(e.target.value);
                      setFormData({...formData, value: formatted});
                    }}
                    onBlur={(e) => {
                      const parsed = parseIndianCurrency(e.target.value);
                      setFormData({...formData, value: parsed.toString()});
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Score (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score === 50 ? '' : formData.score}
                  onChange={(e) => {
                    // Prevent backspace from deleting the first digit
                    const value = e.target.value
                    if (value.length === 1 && e.key === 'Backspace') {
                      e.preventDefault()
                      return
                    }
                    // Only allow numbers 0-100
                    const numValue = parseInt(value) || 0
                    if (numValue < 0 || numValue > 100) {
                      e.target.value = numValue < 0 ? 0 : numValue > 100 ? 100 : numValue
                    } else {
                      e.target.value = value
                    }
                    setFormData({...formData, score: e.target.value || 50})
                  }}
                  onKeyDown={(e) => {
                    // Prevent backspace from deleting the first digit when field is empty or has only one digit
                    const value = e.target.value
                    if (e.key === 'Backspace' && value.length === 1) {
                      e.preventDefault()
                      return
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter score (0-100)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                  >
                    <option value="new">🆕 New</option>
                    <option value="contacted">📞 Contacted</option>
                    <option value="qualified">⭐ Qualified</option>
                    <option value="converted">✅ Converted</option>
                    <option value="lost">❌ Lost</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6m0 0l6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <div className="relative">
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({...formData, source: e.target.value})}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                  >
                    <option value="Website">🌐 Website</option>
                    <option value="Email">📧 Email</option>
                    <option value="Social Media">📱 Social Media</option>
                    <option value="Referral">👥 Referral</option>
                    <option value="Cold Call">📞 Cold Call</option>
                    <option value="Other">📝 Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6m0 0l6-6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <select
                      value={new Date(formData.created_date).getMonth() + 1}
                      onChange={(e) => {
                        const month = e.target.value
                        const day = new Date(formData.created_date).getDate()
                        const year = new Date(formData.created_date).getFullYear()
                        const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                        setFormData({...formData, created_date: newDate})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                    >
                      <option value="">Month</option>
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>
                          {month}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={new Date(formData.created_date).getDate()}
                      onChange={(e) => {
                        const day = e.target.value
                        const month = new Date(formData.created_date).getMonth() + 1
                        const year = new Date(formData.created_date).getFullYear()
                        const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                        setFormData({...formData, created_date: newDate})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                    >
                      <option value="">Day</option>
                      {days.map((day, index) => (
                        <option key={index} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={new Date(formData.created_date).getFullYear()}
                      onChange={(e) => {
                        const year = e.target.value
                        const month = new Date(formData.created_date).getMonth() + 1
                        const day = new Date(formData.created_date).getDate()
                        const newDate = new Date(year, month - 1, day).toISOString().split('T')[0]
                        setFormData({...formData, created_date: newDate})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium appearance-none cursor-pointer hover:border-green-400 transition-colors duration-200"
                    >
                      <option value="">Year</option>
                      {years.map((year, index) => (
                        <option key={index} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows="3"
                  placeholder="Additional notes about this lead..."
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'new').length}</p>
            </div>
            <Target className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'qualified').length}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-gray-800">{leads.filter(l => l.status === 'converted').length}</p>
            </div>
            <CheckCircle className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-800">
                {leads.length > 0 ? Math.round((leads.filter(l => l.status === 'converted').length / leads.length) * 100) : 0}%
              </p>
            </div>
            <Target className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No leads found</p>
                      <p className="text-sm mt-1">Add your first lead to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="text-primary-600" size={16} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail size={12} className="mr-1" />
                            {lead.email}
                          </div>
                          {lead.phone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Phone size={12} className="mr-1" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Building size={14} className="mr-2 text-gray-400" />
                        {lead.company || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Source: {lead.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingLead === lead.id ? (
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="lost">Lost</option>
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(lead.status)}
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                            {lead.status?.charAt(0).toUpperCase() + lead.status?.slice(1)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingLead === lead.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.score}
                          onChange={(e) => setFormData({...formData, score: parseInt(e.target.value) || 50})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <div className="flex items-center">
                          <div className={`text-sm font-medium ${getScoreColor(lead.score)}`}>
                            {lead.score}/100
                          </div>
                          <div className="ml-2 w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                lead.score >= 80 ? 'bg-green-500' : 
                                lead.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${lead.score}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingLead === lead.id ? (
                        <input
                          type="text"
                          value={formData.value}
                          onChange={(e) => setFormData({...formData, value: e.target.value})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <IndianRupee size={14} className="mr-1 text-gray-400" />
                          {formatIndianCurrency(lead.value)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingLead === lead.id ? (
                        <input
                          type="text"
                          value={formData.assigned_to}
                          onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {lead.assigned_to || (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingLead === lead.id ? (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleUpdate(lead.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Save"
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(lead)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(lead.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedLead(lead)
                            setShowActivityModal(true)
                          }}
                          className="text-purple-600 hover:text-purple-900 bg-purple-50 p-2 rounded-lg"
                          title="Add Activity"
                        >
                          <History size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedLead(lead)
                            setShowWhatsAppModal(true)
                            setWhatsappMessage('')
                          }}
                          className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-lg"
                          title="Send WhatsApp Message"
                        >
                          <MessageCircle size={16} />
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

      {/* Activity Timeline Modal */}
      {showActivityModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <History className="mr-2 text-purple-600" size={24} />
                Activity Timeline - {selectedLead.name}
              </h2>
              <button onClick={() => setShowActivityModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Log New Activity</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleAddActivity(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                    <select
                      value={activityForm.type}
                      onChange={(e) => setActivityForm({...activityForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="note">Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={activityForm.date}
                      onChange={(e) => setActivityForm({...activityForm, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (optional)</label>
                    <input
                      type="text"
                      placeholder="30 minutes"
                      value={activityForm.duration}
                      onChange={(e) => setActivityForm({...activityForm, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      value={activityForm.description}
                      onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Describe the activity..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                    <input
                      type="text"
                      value={activityForm.outcome}
                      onChange={(e) => setActivityForm({...activityForm, outcome: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Interested, Follow-up needed, Not interested"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Log Activity
                  </button>
                </form>
              </div>

              {/* Activity History */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Activity History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getLeadActivities(selectedLead.id).length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <History size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>No activities logged yet</p>
                      <p className="text-sm mt-1">Start by logging your first interaction</p>
                    </div>
                  ) : (
                    getLeadActivities(selectedLead.id).map((activity) => (
                      <div key={activity.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            {getActivityIcon(activity.type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 capitalize">
                                {activity.type}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(activity.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {activity.duration && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {activity.duration}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-700">{activity.description}</div>
                        {activity.outcome && (
                          <div className="mt-2 text-sm text-gray-600">
                            <strong>Outcome:</strong> {activity.outcome}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Messaging Modal */}
      {showWhatsAppModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <MessageCircle className="mr-2 text-green-600" size={24} />
                Send WhatsApp Message - {selectedLead.name}
              </h2>
              <button onClick={() => setShowWhatsAppModal(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Lead Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedLead.name}</div>
                  <div><strong>Email:</strong> {selectedLead.email}</div>
                  <div><strong>Phone:</strong> {selectedLead.phone || 'Not provided'}</div>
                  <div><strong>Company:</strong> {selectedLead.company || 'Not provided'}</div>
                  <div><strong>Status:</strong> {selectedLead.status}</div>
                </div>
              </div>

              {/* Message Composition */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-4">Compose Message</h3>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows="4"
                    />
                  </div>

                  <button
                    onClick={handleSendWhatsAppMessage}
                    disabled={!selectedLead?.phone || !whatsappMessage.trim()}
                    className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                      selectedLead?.phone && whatsappMessage.trim()
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <MessageCircle size={20} className="mr-2" />
                    Send WhatsApp Message
                  </button>
                </div>

                {/* Message Suggestions */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3">Message Suggestions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedLead.name}! 👋\n\nI'm reaching out from your recent inquiry. I'd love to discuss how we can help your business grow. When would be a good time for a quick call?\n\nBest regards,\n${selectedLead.assigned_to || 'Your Team'}`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      📞 Follow-up Call Request
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedLead.name}! 👋\n\nThank you for your interest in our services! I have some great information to share that could really benefit ${selectedLead.company || 'your business'}.\n\nWould you be available for a 15-minute demo this week?\n\nLooking forward to connecting!\n\n${selectedLead.assigned_to || 'Your Team'}`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      🎯 Product Demo Request
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedLead.name}! 👋\n\nFollowing up on our previous conversation. I wanted to check if you had any questions about our proposal or if you need any additional information.\n\nI'm here to help make this process as smooth as possible for you.\n\nBest regards,\n${selectedLead.assigned_to || 'Your Team'}`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      📋 Follow-up on Proposal
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedLead.name}! 👋\n\nGreat news! I have some exciting updates about our services that I think you'll love. We've recently added some features that could significantly improve ${selectedLead.company || 'your business'} operations.\n\nCan we schedule a quick call to discuss?\n\nBest regards,\n${selectedLead.assigned_to || 'Your Team'}`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      🚀 New Features Update
                    </button>
                    <button
                      onClick={() => setMessageSuggestion(`Hi ${selectedLead.name}! 👋\n\nI hope you're having a great week! I wanted to personally reach out and see how things are going on your end.\n\nIs there anything I can help with or any questions I can answer?\n\nAlways here to support you!\n\n${selectedLead.assigned_to || 'Your Team'}`)}
                      className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded-md hover:bg-blue-100 text-sm"
                    >
                      💬 General Check-in
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads
