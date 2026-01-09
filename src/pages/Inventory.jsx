import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Calendar,
  DollarSign,
  Truck,
  Warehouse,
  Bell,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Lightbulb,
  Sparkles,
  Target,
  Heart,
  Star,
  Brain,
  Link2,
  Map,
  Camera,
  Mic,
  Zap,
  Gift,
  Rocket,
  Diamond,
  Crown,
  X,
  Tag,
  ChevronDown,
  Info
} from 'lucide-react'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('inspiration')
  const [showQuickCapture, setShowQuickCapture] = useState(false)
  const [showMindMap, setShowMindMap] = useState(false)
  const [quickIdea, setQuickIdea] = useState('')
  const [currency, setCurrency] = useState('INR') // Fixed to INR for Indian users
  const [transactions, setTransactions] = useState([]) // Transaction history
  const [expandedItems, setExpandedItems] = useState(new Set()) // Track expanded items
  const [expandedGridItems, setExpandedGridItems] = useState(new Set()) // Track expanded grid items

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    reorderPoint: 0,
    unitPrice: '',
    supplier: '',
    location: '',
    description: '',
    leadTime: 0,
    status: 'dream',
    inspiration: '',
    source: '',
    mood: 'excited',
    priority: 'high',
    tags: [],
    related: [],
    dreamValue: '',
    potentialProfit: '',
    difficulty: 'medium',
    timeline: '',
    resources: '',
    notes: '',
    // Dream Planning Fields
    targetMarket: '',
    targetAudience: '',
    problemSolved: '',
    uniqueSellingProposition: '',
    competitorAnalysis: '',
    marketSize: '',
    expectedMarketShare: '',
    pricingStrategy: '',
    distributionChannels: '',
    marketingPlan: '',
    developmentStages: '',
    requiredSkills: '',
    budgetNeeded: '',
    fundingSource: '',
    expectedLaunchDate: '',
    successMetrics: '',
    risks: '',
    opportunities: '',
    scalability: '',
    sustainability: '',
    innovationLevel: '',
    technologyRequirements: '',
    legalRequirements: '',
    partnerships: '',
    milestones: '',
    qualityStandards: '',
    customerFeedback: '',
    testingPlan: '',
    launchStrategy: '',
    postLaunchSupport: '',
    growthPlan: '',
    exitStrategy: ''
  })

  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Raw Materials', 'Finished Goods', 'Digital Products', 'Handmade', 'Services', 'Other']
  const dreamStatuses = ['dream', 'researching', 'planning', 'prototyping', 'ready', 'active', 'paused', 'completed']
  const moods = ['excited', 'curious', 'confident', 'cautious', 'ambitious', 'creative']
  const priorities = ['high', 'medium', 'low']
  const difficulties = ['easy', 'medium', 'hard', 'expert']
  const sources = ['saw-in-store', 'online-inspiration', 'customer-request', 'market-gap', 'personal-need', 'trend', 'competition', 'random-idea']
  const statuses = ['dream', 'researching', 'planning', 'prototyping', 'ready', 'active', 'paused', 'completed']
  const currencies = ['INR']
  
  const currencySymbols = {
    'INR': '₹'
  }
  
  const getCurrencySymbol = (curr) => currencySymbols[curr] || '$'
  
  const formatCurrency = (value, curr = currency) => {
    if (!value || value === '') return `${getCurrencySymbol(curr)}0`
    const num = parseFloat(value)
    if (isNaN(num)) return `${getCurrencySymbol(curr)}0`
    
    // Indian currency formatting: 1,23,456.78
    const isNegative = num < 0
    const absNum = Math.abs(num)
    
    // Split into integer and decimal parts
    const [integerPart, decimalPart = ''] = absNum.toFixed(2).split('.')
    
    // Format integer part with Indian system
    let lastThree = integerPart.slice(-3)
    const otherNumbers = integerPart.slice(0, -3)
    
    let formattedInteger = ''
    if (otherNumbers !== '') {
      // Format the remaining digits in groups of 2 from right to left
      const reversed = otherNumbers.split('').reverse().join('')
      const groups = []
      for (let i = 0; i < reversed.length; i += 2) {
        groups.push(reversed.slice(i, i + 2).split('').reverse().join(''))
      }
      formattedInteger = groups.reverse().join(',') + ','
    }
    formattedInteger += lastThree
    
    const result = isNegative ? '-' : '' + getCurrencySymbol(curr) + formattedInteger + (decimalPart ? '.' + decimalPart : '')
    return result
  }

  // Calculate dream progress based on development stage and other factors
  const calculateDreamProgress = (item) => {
    const stageWeights = {
      'concept': 10,
      'design': 25,
      'development': 40,
      'testing': 60,
      'launch': 80,
      'iteration': 95
    }
    
    let progress = stageWeights[item.developmentStages] || 0
    
    // Add points for having detailed information
    if (item.targetMarket) progress += 5
    if (item.pricingStrategy) progress += 5
    if (item.marketingPlan) progress += 5
    if (item.fundingSource) progress += 5
    if (item.expectedLaunchDate) progress += 5
    
    return Math.min(progress, 100)
  }

  // Generate strategic suggestions based on dream data
  const generateStrategicSuggestions = (item) => {
    const suggestions = []
    
    if (!item.targetMarket) {
      suggestions.push("Define your target market clearly to focus your efforts")
    }
    
    if (!item.competitorAnalysis) {
      suggestions.push("Research competitors to identify market gaps and opportunities")
    }
    
    if (!item.pricingStrategy) {
      suggestions.push("Choose a pricing strategy that aligns with your market positioning")
    }
    
    if (item.difficulty === 'hard' && !item.requiredSkills) {
      suggestions.push("Identify required skills early to build the right team")
    }
    
    if (!item.fundingSource && item.budgetNeeded && parseFloat(item.budgetNeeded) > 100000) {
      suggestions.push("Secure funding sources early for large budget requirements")
    }
    
    if (!item.marketingPlan) {
      suggestions.push("Develop a comprehensive marketing plan before launch")
    }
    
    return suggestions.slice(0, 4) // Return top 4 suggestions
  }

  // Generate risk warnings based on dream data
  const generateRiskWarnings = (item) => {
    const warnings = []
    
    if (!item.problemSolved) {
      warnings.push({
        title: "No Clear Problem Statement",
        description: "Define what problem your dream solves to validate market need",
        severity: 'high'
      })
    }
    
    if (!item.uniqueSellingProposition) {
      warnings.push({
        title: "Missing Unique Selling Point",
        description: "Identify what makes your dream different from competitors",
        severity: 'high'
      })
    }
    
    if (item.difficulty === 'expert' && !item.technologyRequirements) {
      warnings.push({
        title: "High Complexity Without Technology Plan",
        description: "Expert-level dreams require detailed technology planning",
        severity: 'high'
      })
    }
    
    if (item.expectedMarketShare && parseFloat(item.expectedMarketShare) > 20) {
      warnings.push({
        title: "Ambitious Market Share Target",
        description: "Consider setting more realistic market share goals initially",
        severity: 'medium'
      })
    }
    
    if (!item.legalRequirements && (item.category === 'Electronics' || item.category === 'Healthcare')) {
      warnings.push({
        title: "Legal Requirements Not Defined",
        description: "This category typically requires regulatory compliance",
        severity: 'medium'
      })
    }
    
    return warnings.slice(0, 3) // Return top 3 warnings
  }

  // Generate actionable next steps
  const generateNextSteps = (item) => {
    const steps = []
    
    if (!item.targetMarket) {
      steps.push({
        title: "Market Research",
        description: "Research and define your target market segment",
        priority: 'high'
      })
    }
    
    if (!item.competitorAnalysis) {
      steps.push({
        title: "Competitor Analysis",
        description: "Analyze at least 3 main competitors",
        priority: 'high'
      })
    }
    
    if (!item.pricingStrategy) {
      steps.push({
        title: "Define Pricing Strategy",
        description: "Choose and document your pricing approach",
        priority: 'medium'
      })
    }
    
    if (!item.fundingSource && item.budgetNeeded) {
      steps.push({
        title: "Secure Funding",
        description: "Identify and approach potential funding sources",
        priority: 'high'
      })
    }
    
    if (!item.marketingPlan) {
      steps.push({
        title: "Create Marketing Plan",
        description: "Develop detailed marketing and launch strategy",
        priority: 'medium'
      })
    }
    
    if (!item.technologyRequirements) {
      steps.push({
        title: "Technology Assessment",
        description: "Identify required tools and technologies",
        priority: 'medium'
      })
    }
    
    return steps.slice(0, 4) // Return top 4 next steps
  }

  // Toggle expanded state for items
  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Toggle expanded state for grid items
  const toggleExpandedGrid = (itemId) => {
    setExpandedGridItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Transaction management functions
  const addTransaction = (type, itemId, amount, description) => {
    const newTransaction = {
      id: Date.now(),
      type, // 'sale', 'purchase', 'expense'
      itemId,
      amount: parseFloat(amount) || 0,
      description,
      date: new Date().toISOString(),
      timestamp: Date.now()
    }
    setTransactions(prev => [...prev, newTransaction])
  }

  const getTransactionsForItem = (itemId) => {
    return transactions.filter(t => t.itemId === itemId)
  }

  const getItemTotalTransactions = (itemId) => {
    const itemTransactions = getTransactionsForItem(itemId)
    return itemTransactions.reduce((total, t) => total + t.amount, 0)
  }

  // Format input value with Indian commas while typing
  const formatInputValue = (value) => {
    // Remove non-numeric characters except dots
    const cleanValue = value.replace(/[^0-9.]/g, '')
    // Add commas in Indian format
    const parts = cleanValue.split('.')
    let integerPart = parts[0] || ''
    const decimalPart = parts[1] || ''
    
    // Format integer part with Indian system
    if (integerPart.length > 3) {
      let lastThree = integerPart.slice(-3)
      let otherNumbers = integerPart.slice(0, -3)
      let formattedInteger = ''
      
      if (otherNumbers !== '') {
        const reversed = otherNumbers.split('').reverse().join('')
        const groups = []
        for (let i = 0; i < reversed.length; i += 2) {
          groups.push(reversed.slice(i, i + 2).split('').reverse().join(''))
        }
        formattedInteger = groups.reverse().join(',') + ','
      }
      formattedInteger += lastThree
      integerPart = formattedInteger
    }
    
    return decimalPart ? `${integerPart}.${decimalPart}` : integerPart
  }
  const getUserInventoryKey = () => {
    const userEmail = 'user@example.com' // In real app, get from auth context
    return `dream_inventory_${userEmail}`
  }

  const getUserCurrencyKey = () => {
    const userEmail = 'user@example.com' // In real app, get from auth context
    return `user_currency_${userEmail}`
  }

  const saveUserInventory = (inventoryData) => {
    try {
      localStorage.setItem(getUserInventoryKey(), JSON.stringify(inventoryData))
    } catch (error) {
      console.error('Failed to save inventory:', error)
    }
  }

  const loadUserInventory = () => {
    try {
      const saved = localStorage.getItem(getUserInventoryKey())
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load inventory:', error)
      return null
    }
  }

  const saveUserCurrency = (currencyValue) => {
    try {
      localStorage.setItem(getUserCurrencyKey(), currencyValue)
    } catch (error) {
      console.error('Failed to save currency:', error)
    }
  }

  const loadUserCurrency = () => {
    try {
      const saved = localStorage.getItem(getUserCurrencyKey())
      return saved || 'INR'
    } catch (error) {
      console.error('Failed to load currency:', error)
      return 'INR'
    }
  }

  useEffect(() => {
    // Load user's saved currency preference
    const savedCurrency = loadUserCurrency()
    setCurrency(savedCurrency)
    
    // Load user's saved inventory or start with empty array
    const savedInventory = loadUserInventory()
    if (savedInventory && savedInventory.length > 0) {
      setInventory(savedInventory)
    } else {
      // Start with empty inventory for new users
      setInventory([])
    }
  }, [])

  // Save inventory data whenever it changes
  useEffect(() => {
    if (inventory.length > 0) {
      saveUserInventory(inventory)
    }
  }, [inventory])

  // Save currency preference whenever it changes
  useEffect(() => {
    saveUserCurrency(currency)
  }, [currency])

  const getDreamStatus = (item) => {
    const statusMap = {
      'dream': { textColor: 'text-purple-600', bgColor: 'bg-purple-100', icon: Sparkles, label: 'Dream' },
      'researching': { textColor: 'text-blue-600', bgColor: 'bg-blue-100', icon: Search, label: 'Researching' },
      'planning': { textColor: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Calendar, label: 'Planning' },
      'prototyping': { textColor: 'text-orange-600', bgColor: 'bg-orange-100', icon: Package, label: 'Prototyping' },
      'ready': { textColor: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Ready' },
      'active': { textColor: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: Rocket, label: 'Active' },
      'paused': { textColor: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock, label: 'Paused' },
      'completed': { textColor: 'text-indigo-600', bgColor: 'bg-indigo-100', icon: Crown, label: 'Completed' }
    }
    return statusMap[item.status] || statusMap['dream']
  }

  const getMoodIcon = (mood) => {
    const moodMap = {
      'excited': { icon: Zap, color: 'text-yellow-500' },
      'curious': { icon: Lightbulb, color: 'text-blue-500' },
      'confident': { icon: Star, color: 'text-green-500' },
      'cautious': { icon: AlertTriangle, color: 'text-orange-500' },
      'ambitious': { icon: Target, color: 'text-red-500' },
      'creative': { icon: Brain, color: 'text-purple-500' }
    }
    return moodMap[mood] || moodMap['excited']
  }

  const getPriorityColor = (priority) => {
    const priorityMap = {
      'high': 'text-red-600 bg-red-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-green-600 bg-green-100'
    }
    return priorityMap[priority] || priorityMap['medium']
  }

  const calculateDreamValue = () => {
    return inventory.reduce((total, item) => {
      const value = parseFloat(item.dreamValue) || 0
      return total + value
    }, 0)
  }

  const calculatePotentialProfit = () => {
    return inventory.reduce((total, item) => {
      const profit = parseFloat(item.potentialProfit) || 0
      return total + profit
    }, 0)
  }

  const getActiveDreams = () => {
    return inventory.filter(item => ['dream', 'researching', 'planning', 'prototyping'].includes(item.status)).length
  }

  const getReadyDreams = () => {
    return inventory.filter(item => item.status === 'ready').length
  }

  const handleQuickCapture = () => {
    if (quickIdea.trim()) {
      const newItem = {
        id: Date.now(),
        name: quickIdea,
        sku: `QUICK-${Date.now()}`,
        category: 'Other',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        reorderPoint: 0,
        unitPrice: '',
        supplier: '',
        location: '',
        description: '',
        leadTime: 0,
        status: 'dream',
        inspiration: 'Quick captured idea',
        source: 'random-idea',
        mood: 'excited',
        priority: 'medium',
        tags: [],
        related: [],
        dreamValue: '',
        potentialProfit: '',
        difficulty: 'medium',
        timeline: '',
        resources: '',
        notes: '',
        lastUpdated: new Date().toISOString().split('T')[0],
        trend: 'stable',
        monthlySales: 0,
        projectedDemand: 0
      }
      const updatedInventory = [...inventory, newItem]
      setInventory(updatedInventory)
      setQuickIdea('')
      setShowQuickCapture(false)
    }
  }

  const calculateInventoryValue = () => {
    return inventory.reduce((total, item) => total + (item.currentStock * item.unitPrice), 0)
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.currentStock <= item.reorderPoint).length
  }

  const getOutStockItems = () => {
    return inventory.filter(item => item.currentStock === 0).length
  }

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.inspiration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    if (sortBy === 'inspiration') return b.dreamValue - a.dreamValue
    if (sortBy === 'profit') return b.potentialProfit - a.potentialProfit
    if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (showEditModal && selectedItem) {
      const updatedInventory = inventory.map(item => 
        item.id === selectedItem.id 
          ? { ...formData, id: selectedItem.id, lastUpdated: new Date().toISOString().split('T')[0] }
          : item
      )
      setInventory(updatedInventory)
    } else {
      const newItem = {
        ...formData,
        id: Date.now(),
        lastUpdated: new Date().toISOString().split('T')[0],
        trend: 'stable',
        monthlySales: 0,
        projectedDemand: 0
      }
      setInventory(prev => [...prev, newItem])
    }
    setShowAddModal(false)
    setShowEditModal(false)
    setFormData({
      name: '',
      sku: '',
      category: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      reorderPoint: 0,
      unitPrice: '',
      supplier: '',
      location: '',
      description: '',
      leadTime: 0,
      status: 'dream',
      inspiration: '',
      source: '',
      mood: 'excited',
      priority: 'high',
      tags: [],
      related: [],
      dreamValue: '',
      potentialProfit: '',
      difficulty: 'medium',
      timeline: '',
      resources: '',
      notes: ''
    })
  }

  const handleEdit = (item) => {
    setSelectedItem(item)
    setFormData(item)
    setShowEditModal(true)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedInventory = inventory.filter(item => item.id !== id)
      setInventory(updatedInventory)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="text-purple-600" />
          Dream Inventory Planning
        </h1>
        <p className="text-gray-600">Transform your ideas into reality - capture inspiration, plan products, and manage your dream inventory</p>
      </div>

      {/* Dream Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total Dreams</p>
              <p className="text-2xl font-bold">{inventory.length}</p>
            </div>
            <Brain className="h-8 w-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Dream Value</p>
              <p className="text-2xl font-bold">{formatCurrency(calculateDreamValue())}</p>
            </div>
            <Diamond className="h-8 w-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Potential Profit</p>
              <p className="text-2xl font-bold">{formatCurrency(calculatePotentialProfit())}</p>
            </div>
            <Rocket className="h-8 w-8 text-white/80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Active Dreams</p>
              <p className="text-2xl font-bold">{getActiveDreams()}</p>
            </div>
            <Zap className="h-8 w-8 text-white/80" />
          </div>
        </div>
      </div>

      {/* Dream Actions Bar */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search dreams, inspiration, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Dreams</option>
              {dreamStatuses.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="inspiration">Sort by Dream Value</option>
              <option value="profit">Sort by Profit</option>
              <option value="priority">Sort by Priority</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowQuickCapture(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all flex items-center gap-2 shadow-md"
            >
              <Lightbulb size={16} />
              Quick Idea
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {viewMode === 'list' ? 'List View' : 'Grid View'}
            </button>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              Add Dream
            </button>
          </div>
        </div>
      </div>

      {/* Dream Inventory Display */}
      <div className="min-h-[400px]">
        {(() => {
          try {
            if (viewMode === 'list') {
              return (
                <div className="space-y-6">
                  {filteredInventory.map(item => {
                    const dreamStatus = getDreamStatus(item)
                    const StatusIcon = dreamStatus.icon
                    const expanded = expandedItems.has(item.id)
                    
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                        {/* Main Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold">{item.name}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${dreamStatus.bgColor} ${dreamStatus.textColor} flex items-center gap-1`}>
                                  <StatusIcon size={14} />
                                  {dreamStatus.label}
                                </span>
                              </div>
                              <p className="text-purple-100 mb-3">{item.description || 'No description available'}</p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <Tag size={14} />
                                  {item.category}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target size={14} />
                                  {item.targetMarket || 'No market defined'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {item.timeline || 'No timeline'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Expandable Details */}
                        <div className="p-6">
                          <button
                            onClick={() => toggleExpanded(item.id)}
                            className="w-full flex items-center justify-between text-gray-700 hover:text-purple-600 transition-colors mb-4"
                          >
                            <span className="font-semibold">View Analysis</span>
                            <ChevronDown className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} size={20} />
                          </button>
                          
                          {expanded && (
                            <div className="space-y-4 mt-4 border-t pt-4">
                              {/* Real Analytics Dashboard */}
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                                  <BarChart3 size={16} className="text-purple-600" />
                                  Dream Analytics & Metrics
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  {/* Financial Metrics */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                      <DollarSign size={16} className="text-green-500" />
                                      Financial Analysis
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Dream Value:</span>
                                        <span className="font-bold text-purple-600">{formatCurrency(item.dreamValue)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Potential Profit:</span>
                                        <span className="font-bold text-green-600">{formatCurrency(item.potentialProfit)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Profit Margin:</span>
                                        <span className="font-bold text-blue-600">
                                          {item.dreamValue && item.potentialProfit ? 
                                            `${((parseFloat(item.potentialProfit) / parseFloat(item.dreamValue)) * 100).toFixed(1)}%` : 
                                            'N/A'
                                          }
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Budget Needed:</span>
                                        <span className="font-bold text-orange-600">{formatCurrency(item.budgetNeeded)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Funding Gap:</span>
                                        <span className="font-bold text-red-600">
                                          {item.budgetNeeded && item.fundingSource ? 'Covered' : 
                                           item.budgetNeeded ? formatCurrency(item.budgetNeeded) : 'N/A'
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Market Metrics */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                      <Target size={16} className="text-blue-500" />
                                      Market Analysis
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Target Market:</span>
                                        <span className="font-bold text-blue-600">{item.targetMarket || 'Not defined'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Market Size:</span>
                                        <span className="font-bold text-purple-600">{item.marketSize || 'Not analyzed'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Target Share:</span>
                                        <span className="font-bold text-purple-600">{item.expectedMarketShare ? `${item.expectedMarketShare}%` : 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Competition:</span>
                                        <span className="font-bold text-orange-600">
                                          {item.competitorAnalysis ? 'Analyzed' : 'Not analyzed'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">USP Defined:</span>
                                        <span className="font-bold text-green-600">
                                          {item.uniqueSellingProposition ? 'Yes' : 'No'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Progress Metrics */}
                                  <div className="bg-white rounded-lg p-4 shadow-sm">
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                      <TrendingUp size={16} className="text-green-500" />
                                      Progress Tracking
                                    </h5>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Development Stage:</span>
                                        <span className="font-bold text-purple-600">{item.developmentStages || 'Not set'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Difficulty Level:</span>
                                        <span className={`font-bold ${
                                          item.difficulty === 'easy' ? 'text-green-600' :
                                          item.difficulty === 'medium' ? 'text-yellow-600' :
                                          'text-red-600'
                                        }`}>
                                          {item.difficulty || 'Not set'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Timeline:</span>
                                        <span className="font-bold text-blue-600">{item.timeline || 'Not set'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Priority:</span>
                                        <span className={`font-bold ${
                                          item.priority === 'high' ? 'text-red-600' :
                                          item.priority === 'medium' ? 'text-yellow-600' :
                                          'text-green-600'
                                        }`}>
                                          {item.priority || 'Not set'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">Launch Date:</span>
                                        <span className="font-bold text-green-600">{item.expectedLaunchDate || 'Not set'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mb-6">
                                  <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium text-gray-700">Overall Completion</span>
                                    <span className="font-bold text-purple-600">{calculateDreamProgress(item)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div 
                                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                      style={{
                                        width: `${calculateDreamProgress(item)}%`
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Business Strategy Summary */}
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                                <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                                  <Rocket size={18} className="text-green-600" />
                                  Business Strategy Summary
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Pricing & Distribution</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Pricing Strategy:</span>
                                        <p className="text-gray-600">{item.pricingStrategy || 'Not defined'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Unit Price:</span>
                                        <p className="text-gray-600">{formatCurrency(item.unitPrice)}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Distribution Channels:</span>
                                        <p className="text-gray-600">{item.distributionChannels || 'Not defined'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Marketing & Funding</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Marketing Plan:</span>
                                        <p className="text-gray-600">{item.marketingPlan ? 'Defined' : 'Not defined'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Funding Source:</span>
                                        <p className="text-gray-600">{item.fundingSource || 'Not identified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Success Metrics:</span>
                                        <p className="text-gray-600">{item.successMetrics || 'Not defined'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Development & Technical Summary */}
                              <div className="bg-white rounded-lg p-6 shadow-sm border">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <Package size={18} className="text-orange-600" />
                                  Development & Technical Summary
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Development Requirements</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Required Skills:</span>
                                        <p className="text-gray-600">{item.requiredSkills || 'Not identified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Technology Needs:</span>
                                        <p className="text-gray-600">{item.technologyRequirements || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Legal Requirements:</span>
                                        <p className="text-gray-600">{item.legalRequirements || 'Not specified'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Resources & Planning</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Resources Needed:</span>
                                        <p className="text-gray-600">{item.resources || 'Not specified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Partnerships:</span>
                                        <p className="text-gray-600">{item.partnerships || 'Not identified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Milestones:</span>
                                        <p className="text-gray-600">{item.milestones || 'Not set'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Market Position Summary */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                                <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                                  <Target size={18} className="text-blue-600" />
                                  Market Position Summary
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Target Market Details</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Target Audience:</span>
                                        <p className="text-gray-600">{item.targetAudience || 'Not defined'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Problem Solved:</span>
                                        <p className="text-gray-600">{item.problemSolved || 'Not identified'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Market Size:</span>
                                        <p className="text-gray-600">{item.marketSize || 'Not analyzed'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-3">Competitive Analysis</h5>
                                    <div className="space-y-2 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-700">Unique Selling Point:</span>
                                        <p className="text-gray-600">{item.uniqueSellingProposition || 'Not defined'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Competitor Analysis:</span>
                                        <p className="text-gray-600">{item.competitorAnalysis || 'Not conducted'}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-700">Expected Market Share:</span>
                                        <p className="text-gray-600">{item.expectedMarketShare ? `${item.expectedMarketShare}%` : 'Not set'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            } else {
              // Grid view
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredInventory.map(item => {
                    const dreamStatus = getDreamStatus(item)
                    const StatusIcon = dreamStatus.icon
                    const expanded = expandedGridItems.has(item.id)
                    
                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                        {/* Header with gradient */}
                        <div className={`h-3 bg-gradient-to-r ${
                          item.status === 'dream' ? 'from-purple-400 to-pink-400' :
                          item.status === 'researching' ? 'from-blue-400 to-cyan-400' :
                          item.status === 'planning' ? 'from-yellow-400 to-orange-400' :
                          item.status === 'prototyping' ? 'from-orange-400 to-red-400' :
                          item.status === 'ready' ? 'from-green-400 to-emerald-400' :
                          item.status === 'active' ? 'from-emerald-400 to-teal-400' :
                          'from-gray-400 to-gray-500'
                        }`} />
                        
                        <div className="p-5">
                          {/* Title and Status */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${dreamStatus.bgColor} ${dreamStatus.textColor}`}>
                                <StatusIcon size={12} />
                                {dreamStatus.label}
                              </span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-purple-50 rounded-lg p-3">
                              <p className="text-xs text-purple-600 font-medium mb-1">Dream Value</p>
                              <p className="text-sm font-bold text-purple-900">{formatCurrency(item.dreamValue)}</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs text-green-600 font-medium mb-1">Potential Profit</p>
                              <p className="text-sm font-bold text-green-900">{formatCurrency(item.potentialProfit)}</p>
                            </div>
                          </div>
                          
                          {/* Key Information */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Target size={14} className="text-blue-500" />
                              <span className="truncate">{item.targetMarket || 'No market'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock size={14} className="text-orange-500" />
                              <span>{item.timeline || 'No timeline'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Tag size={14} className="text-purple-500" />
                              <span>{item.category}</span>
                            </div>
                          </div>
                          
                          {/* Progress Indicators */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Development Stage</span>
                              <span className="font-medium text-gray-900">{item.developmentStages || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Market Share Goal</span>
                              <span className="font-medium text-blue-600">{item.expectedMarketShare ? `${item.expectedMarketShare}%` : 'N/A'}</span>
                            </div>
                          </div>
                          
                          {/* Budget Indicator */}
                          {item.budgetNeeded && (
                            <div className="bg-orange-50 rounded-lg p-3 mb-4">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-orange-600 font-medium">Budget Needed</span>
                                <span className="text-sm font-bold text-orange-900">{formatCurrency(item.budgetNeeded)}</span>
                              </div>
                            </div>
                          )}
                          
                          {/* Description Preview */}
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {item.description || item.inspiration || 'No description available'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          } catch (error) {
            console.error('Error rendering inventory view:', error)
            return (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700">Error loading inventory view. Please refresh the page.</p>
              </div>
            )
          }
        })()}
      </div>

      {/* Quick Capture Modal */}
      {showQuickCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold">Quick Idea Capture</h2>
              </div>
              
              <p className="text-gray-600 mb-4">Quickly capture your brilliant idea before it escapes!</p>
              
              <textarea
                value={quickIdea}
                onChange={(e) => setQuickIdea(e.target.value)}
                placeholder="Describe your dream product or idea..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent h-32 resize-none"
                autoFocus
              />
              
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickCapture(false)
                    setQuickIdea('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuickCapture}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
                >
                  Capture Dream
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Sparkles size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {showEditModal ? 'Edit Your Dream' : 'Create New Dream'}
                    </h2>
                    <p className="text-purple-100 text-sm mt-1">
                      {showEditModal ? 'Update your dream details' : 'Transform your idea into reality'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setShowEditModal(false)
                  }}
                  className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="bg-gray-50 px-6 py-3 border-b">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                  <span>Basic Info</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">2</div>
                  <span>Dream Details</span>
                </div>
                <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">3</div>
                  <span>Business</span>
                </div>
              </div>
            </div>
            
            {/* Form content */}
            <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Package size={18} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Dream Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter your dream product name..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        SKU
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Auto-generated or custom SKU"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        {dreamStatuses.map(status => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Describe your dream product in detail..."
                    />
                  </div>
                </div>
                
                {/* Dream Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Brain size={18} className="text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Dream Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Lightbulb size={16} className="text-yellow-500" />
                        Inspiration Source <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.source}
                        onChange={(e) => setFormData({...formData, source: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="">Where did this idea come from?</option>
                        {sources.map(source => (
                          <option key={source} value={source}>
                            {source.replace('-', ' ').charAt(0).toUpperCase() + source.replace('-', ' ').slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Heart size={16} className="text-red-500" />
                        Your Mood
                      </label>
                      <select
                        value={formData.mood}
                        onChange={(e) => setFormData({...formData, mood: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        {moods.map(mood => (
                          <option key={mood} value={mood}>
                            {mood.charAt(0).toUpperCase() + mood.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Target size={16} className="text-orange-500" />
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        {priorities.map(priority => (
                          <option key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <AlertTriangle size={16} className="text-yellow-600" />
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Diamond size={16} className="text-blue-500" />
                        Dream Value (₹)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.dreamValue ? formatInputValue(formData.dreamValue) : ''}
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
                          setFormData({...formData, dreamValue: cleanValue})
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter amount (e.g., 1,23,456)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Rocket size={16} className="text-green-500" />
                        Potential Profit (₹)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.potentialProfit ? formatInputValue(formData.potentialProfit) : ''}
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
                          setFormData({...formData, potentialProfit: cleanValue})
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter amount (e.g., 45,678)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Clock size={16} className="text-purple-500" />
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={formData.timeline}
                        onChange={(e) => setFormData({...formData, timeline: e.target.value})}
                        placeholder="e.g., 3 months, 2 weeks"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Tag size={16} className="text-gray-500" />
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags.join(', ')}
                        onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)})}
                        placeholder="e.g., eco-friendly, tech, innovative"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Sparkles size={16} className="text-purple-500" />
                      Inspiration Story
                    </label>
                    <textarea
                      value={formData.inspiration}
                      onChange={(e) => setFormData({...formData, inspiration: e.target.value})}
                      rows={4}
                      placeholder="Tell the story behind this dream... What inspired you? What problem does it solve?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
                
                {/* Market Analysis */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Target size={18} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Market Analysis</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Target Market</label>
                      <input
                        type="text"
                        value={formData.targetMarket}
                        onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., Urban millennials, Small businesses"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Target Audience</label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., Age 25-35, Tech-savvy professionals"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Problem Solved</label>
                      <textarea
                        value={formData.problemSolved}
                        onChange={(e) => setFormData({...formData, problemSolved: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="What specific problem does your dream solve?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Unique Selling Proposition</label>
                      <input
                        type="text"
                        value={formData.uniqueSellingProposition}
                        onChange={(e) => setFormData({...formData, uniqueSellingProposition: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="What makes your dream unique?"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Market Size</label>
                      <input
                        type="text"
                        value={formData.marketSize}
                        onChange={(e) => setFormData({...formData, marketSize: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., ₹50,00,000 market size"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Expected Market Share (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.expectedMarketShare}
                        onChange={(e) => setFormData({...formData, expectedMarketShare: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., 5"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Competitor Analysis</label>
                    <textarea
                      value={formData.competitorAnalysis}
                      onChange={(e) => setFormData({...formData, competitorAnalysis: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Who are your competitors? What are their strengths/weaknesses?"
                    />
                  </div>
                </div>
                
                {/* Business Strategy */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Rocket size={18} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Business Strategy</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Pricing Strategy</label>
                      <select
                        value={formData.pricingStrategy}
                        onChange={(e) => setFormData({...formData, pricingStrategy: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="">Select Strategy</option>
                        <option value="premium">Premium Pricing</option>
                        <option value="competitive">Competitive Pricing</option>
                        <option value="value">Value-Based Pricing</option>
                        <option value="freemium">Freemium Model</option>
                        <option value="subscription">Subscription Model</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Distribution Channels</label>
                      <input
                        type="text"
                        value={formData.distributionChannels}
                        onChange={(e) => setFormData({...formData, distributionChannels: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., Online, Retail stores, Direct sales, Partnerships"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Marketing Plan</label>
                    <textarea
                      value={formData.marketingPlan}
                      onChange={(e) => setFormData({...formData, marketingPlan: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="How will you market your dream? Social media, content marketing, ads, etc."
                    />
                  </div>
                </div>
                
                {/* Development Planning */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Package size={18} className="text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Development Planning</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Development Stages</label>
                      <select
                        value={formData.developmentStages}
                        onChange={(e) => setFormData({...formData, developmentStages: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="">Select Stage</option>
                        <option value="concept">Concept & Research</option>
                        <option value="design">Design & Prototyping</option>
                        <option value="development">Development</option>
                        <option value="testing">Testing & QA</option>
                        <option value="launch">Launch & Marketing</option>
                        <option value="iteration">Iteration & Improvement</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Required Skills</label>
                      <input
                        type="text"
                        value={formData.requiredSkills}
                        onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., Programming, Design, Marketing, Sales"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Technology Requirements</label>
                      <textarea
                        value={formData.technologyRequirements}
                        onChange={(e) => setFormData({...formData, technologyRequirements: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="What technology, software, or tools do you need?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Legal Requirements</label>
                      <textarea
                        value={formData.legalRequirements}
                        onChange={(e) => setFormData({...formData, legalRequirements: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Patents, licenses, regulations, compliance needed"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Financial Planning */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <DollarSign size={18} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Financial Planning</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Budget Needed (₹)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.budgetNeeded ? formatInputValue(formData.budgetNeeded) : ''}
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
                          setFormData({...formData, budgetNeeded: cleanValue})
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., 5,00,000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Funding Source</label>
                      <select
                        value={formData.fundingSource}
                        onChange={(e) => setFormData({...formData, fundingSource: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      >
                        <option value="">Select Source</option>
                        <option value="self-funded">Self-Funded</option>
                        <option value="bootstrapped">Bootstrapped</option>
                        <option value="friends-family">Friends & Family</option>
                        <option value="angel-investors">Angel Investors</option>
                        <option value="venture-capital">Venture Capital</option>
                        <option value="crowdfunding">Crowdfunding</option>
                        <option value="bank-loan">Bank Loan</option>
                        <option value="grants">Grants</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Expected Launch Date</label>
                      <input
                        type="date"
                        value={formData.expectedLaunchDate}
                        onChange={(e) => setFormData({...formData, expectedLaunchDate: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Success Metrics</label>
                      <input
                        type="text"
                        value={formData.successMetrics}
                        onChange={(e) => setFormData({...formData, successMetrics: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="e.g., 1000 users in 6 months, ₹10L revenue"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Risk Assessment */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Risk Assessment</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Risks</label>
                      <textarea
                        value={formData.risks}
                        onChange={(e) => setFormData({...formData, risks: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="What are the potential risks and challenges?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Opportunities</label>
                      <textarea
                        value={formData.opportunities}
                        onChange={(e) => setFormData({...formData, opportunities: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="What opportunities does this dream present?"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Growth & Sustainability */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <TrendingUp size={18} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Growth & Sustainability</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Scalability</label>
                      <textarea
                        value={formData.scalability}
                        onChange={(e) => setFormData({...formData, scalability: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="How can this dream scale to serve more customers?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Sustainability</label>
                      <textarea
                        value={formData.sustainability}
                        onChange={(e) => setFormData({...formData, sustainability: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="How will this dream be environmentally and socially sustainable?"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Launch & Support Planning */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <Rocket size={18} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Launch & Support Planning</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Partnerships</label>
                      <input
                        type="text"
                        value={formData.partnerships}
                        onChange={(e) => setFormData({...formData, partnerships: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Who will you partner with? Suppliers, distributors, influencers"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Milestones</label>
                      <textarea
                        value={formData.milestones}
                        onChange={(e) => setFormData({...formData, milestones: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="Key milestones and deadlines for your dream"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Quality Standards</label>
                      <textarea
                        value={formData.qualityStandards}
                        onChange={(e) => setFormData({...formData, qualityStandards: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="What quality standards will you maintain?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Customer Feedback Plan</label>
                      <textarea
                        value={formData.customerFeedback}
                        onChange={(e) => setFormData({...formData, customerFeedback: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="How will you collect and use customer feedback?"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Testing & Launch */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <CheckCircle size={18} className="text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Testing & Launch Strategy</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Testing Plan</label>
                      <textarea
                        value={formData.testingPlan}
                        onChange={(e) => setFormData({...formData, testingPlan: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="How will you test your dream before launch?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Launch Strategy</label>
                      <textarea
                        value={formData.launchStrategy}
                        onChange={(e) => setFormData({...formData, launchStrategy: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                        placeholder="How will you launch and promote your dream?"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Post-Launch Support</label>
                    <textarea
                      value={formData.postLaunchSupport}
                      onChange={(e) => setFormData({...formData, postLaunchSupport: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="How will you support customers after launch?"
                    />
                  </div>
                </div>
                
                {/* Long-term Vision */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Star size={18} className="text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Long-term Vision</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Growth Plan</label>
                    <textarea
                      value={formData.growthPlan}
                      onChange={(e) => setFormData({...formData, growthPlan: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="How will you grow this dream over the next 3-5 years?"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Exit Strategy</label>
                    <textarea
                      value={formData.exitStrategy}
                      onChange={(e) => setFormData({...formData, exitStrategy: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="What is your long-term exit strategy? (IPO, acquisition, lifestyle business)"
                    />
                  </div>
                </div>
                
                {/* Business Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <DollarSign size={18} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Business Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Unit Price (₹)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formData.unitPrice ? formatInputValue(formData.unitPrice) : ''}
                        onChange={(e) => {
                          const cleanValue = e.target.value.replace(/[^0-9.]/g, '')
                          setFormData({...formData, unitPrice: cleanValue})
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Enter amount (e.g., 2,499)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Supplier</label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Supplier name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="Where will you work on this?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Lead Time (days)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.leadTime}
                        onChange={(e) => setFormData({...formData, leadTime: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Package size={16} className="text-orange-500" />
                      Resources Needed
                    </label>
                    <textarea
                      value={formData.resources}
                      onChange={(e) => setFormData({...formData, resources: e.target.value})}
                      rows={3}
                      placeholder="What resources do you need to make this dream a reality?"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 flex items-center gap-1">
                      <Edit size={16} className="text-gray-500" />
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      placeholder="Any additional notes or thoughts..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setFormData({
                        name: '',
                        sku: '',
                        category: '',
                        currentStock: 0,
                        minStock: 0,
                        maxStock: 0,
                        reorderPoint: 0,
                        unitPrice: '',
                        supplier: '',
                        location: '',
                        description: '',
                        leadTime: 0,
                        status: 'dream',
                        inspiration: '',
                        source: '',
                        mood: 'excited',
                        priority: 'high',
                        tags: [],
                        related: [],
                        dreamValue: '',
                        potentialProfit: '',
                        difficulty: 'medium',
                        timeline: '',
                        resources: '',
                        notes: '',
                        targetMarket: '',
                        targetAudience: '',
                        problemSolved: '',
                        uniqueSellingProposition: '',
                        competitorAnalysis: '',
                        marketSize: '',
                        expectedMarketShare: '',
                        pricingStrategy: '',
                        distributionChannels: '',
                        marketingPlan: '',
                        developmentStages: '',
                        requiredSkills: '',
                        budgetNeeded: '',
                        fundingSource: '',
                        expectedLaunchDate: '',
                        successMetrics: '',
                        risks: '',
                        opportunities: '',
                        scalability: '',
                        sustainability: '',
                        innovationLevel: '',
                        technologyRequirements: '',
                        legalRequirements: '',
                        partnerships: '',
                        milestones: '',
                        qualityStandards: '',
                        customerFeedback: '',
                        testingPlan: '',
                        launchStrategy: '',
                        postLaunchSupport: '',
                        growthPlan: '',
                        exitStrategy: ''
                      })
                    }}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    {showEditModal ? 'Update Dream' : 'Create Dream'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
