import React, { createContext, useContext, useEffect, useState } from 'react'
import { crmSupabase, createUserSupabaseClient, getUserSupabaseClient } from '../config/supabase-multi.js'
import { userProjectService } from '../services/userProjectService.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProject, setUserProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userSupabase, setUserSupabase] = useState(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      console.log('AuthContext: Getting initial session...')
      const { data: { session } } = await crmSupabase.auth.getSession()
      console.log('AuthContext: Initial session:', session)
      setUser(session?.user ?? null)
      
      // If user exists, get their Supabase project
      if (session?.user) {
        console.log('AuthContext: User found, loading project...')
        await loadUserProject(session.user.id)
      }
      
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = crmSupabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', { event, session })
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('AuthContext: User logged in, loading project...')
          await loadUserProject(session.user.id)
        } else {
          console.log('AuthContext: User logged out, clearing project...')
          setUserProject(null)
          setUserSupabase(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProject = async (userId) => {
    try {
      const project = await userProjectService.getUserProject(userId)
      if (project) {
        setUserProject(project)
        
        // Create user's Supabase client
        const userClient = createUserSupabaseClient(
          project.supabase_url,
          project.supabase_anon_key
        )
        setUserSupabase(userClient)
        console.log('User Supabase client initialized:', project.supabase_url)
      }
    } catch (error) {
      console.error('Error loading user project:', error)
    }
  }

  const login = async (email, password) => {
    console.log('Attempting login with:', email)
    
    const { data, error } = await crmSupabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log('Login response:', { data, error })

    if (error) {
      console.error('Login error:', error)
      throw error
    }
    
    console.log('Login successful:', data)
    return data
  }

  const signup = async (email, password, metadata = {}) => {
    try {
      console.log('Starting signup process for:', email)
      
      // First, sign up user in CRM system
      const { data: signUpData, error: signUpError } = await crmSupabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin
        }
      })

      if (signUpError) {
        console.error('Signup error:', signUpError)
        throw signUpError
      }

      console.log('CRM signup successful:', signUpData)

      // Create unique Supabase project for user
      if (signUpData.user) {
        try {
          const userProject = await userProjectService.createUserProject(
            signUpData.user.id,
            metadata.company || `${signUpData.user.email}-crm`
          )
          console.log('User Supabase project created:', userProject)
          
          // Load the newly created project
          await loadUserProject(signUpData.user.id)
        } catch (projectError) {
          console.error('Error creating user project:', projectError)
        }
      }

      // Try to sign in immediately
      const { data: signInData, error: signInError } = await crmSupabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Auto login error:', signInError)
        return signUpData
      }

      console.log('Auto login successful:', signInData)
      
      // Force a small delay to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return signInData
    } catch (error) {
      console.error('Signup process error:', error)
      throw error
    }
  }

  const logout = async () => {
    const { error } = await crmSupabase.auth.signOut()
    if (error) throw error
    
    // Clear user project data
    setUserProject(null)
    setUserSupabase(null)
  }

  const value = {
    user,
    userProject,
    userSupabase,
    login,
    signup,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
