import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { testSupabaseConnection } from '../config/supabase.js'
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle } from 'lucide-react'

const Login = () => {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('checking')
  
  const { login, signup } = useAuth()

  useEffect(() => {
    // Test Supabase connection on component mount
    const checkConnection = async () => {
      try {
        const result = await testSupabaseConnection()
        if (result.connected) {
          setConnectionStatus('connected')
        } else {
          setConnectionStatus('error')
          console.error('Supabase connection failed:', result.error)
        }
      } catch (err) {
        setConnectionStatus('error')
        console.error('Connection test error:', err)
      }
    }
    
    checkConnection()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Form submitted:', { isSignup, email })

      if (isSignup) {
        // Validate passwords match for signup
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long')
          return
        }

        const metadata = {
          full_name: fullName,
          company: company,
          role: 'business_owner'
        }

        console.log('Attempting signup with metadata:', metadata)
        const result = await signup(email, password, metadata)
        console.log('Signup result:', result)
        
        // Check if user is now logged in
        if (result.session || result.user) {
          setMessage('Account created successfully! Redirecting to dashboard...')
          
          // Clear form immediately
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setFullName('')
          setCompany('')
          
          // Wait a moment for the auth state to update, then let the App handle redirect
          setTimeout(() => {
            setMessage('')
          }, 2000)
        } else {
          setMessage('Account created! Please try logging in.')
          // Switch to login mode
          setTimeout(() => {
            setIsSignup(false)
            setMessage('')
          }, 2000)
        }
      } else {
        console.log('Attempting login...')
        const result = await login(email, password)
        console.log('Login result:', result)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      
      // More specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Email verification required. Please check your email or contact support.')
      } else if (error.message?.includes('User not found')) {
        setError('No account found with this email address. Please sign up first.')
      } else if (error.message?.includes('User already registered')) {
        setError('An account with this email already exists. Please try logging in.')
      } else {
        setError(error.message || (isSignup ? 'Signup failed' : 'Login failed'))
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError('')
    setMessage('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setCompany('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            {isSignup ? <User className="h-6 w-6 text-white" /> : <Lock className="h-6 w-6 text-white" />}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignup ? 'Create your CRM account' : 'Sign in to CRM'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignup 
              ? 'Start managing your business today' 
              : 'Enter your credentials to access the dashboard'
            }
          </p>
          
          {/* Connection Status Indicator */}
          <div className="mt-4 flex justify-center">
            {connectionStatus === 'checking' && (
              <div className="flex items-center text-yellow-600 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
                Checking connection...
              </div>
            )}
            {connectionStatus === 'connected' && (
              <div className="flex items-center text-green-600 text-sm">
                <div className="h-2 w-2 bg-green-600 rounded-full mr-2"></div>
                Connected to Supabase
              </div>
            )}
            {connectionStatus === 'error' && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                Connection error - check console
              </div>
            )}
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required={isSignup}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company (Optional)
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={isSignup}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
