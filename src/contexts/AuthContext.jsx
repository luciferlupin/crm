import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseAdmin } from '../config/supabase'

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    console.log('Attempting login with:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
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
      
      // First, try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

      console.log('Signup successful:', signUpData)

      // If user was created but email verification is required, bypass it using admin
      if (signUpData.user && !signUpData.session) {
        console.log('Email verification required, attempting to bypass...')
        
        try {
          // Use admin client to update user email confirmation
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            signUpData.user.id,
            { 
              email_confirm: true,
              user_metadata: metadata 
            }
          )

          if (updateError) {
            console.error('Admin update error:', updateError)
          } else {
            console.log('Email confirmation bypassed:', updateData)
          }
        } catch (adminErr) {
          console.error('Admin bypass failed:', adminErr)
        }

        // Now try to sign in with the same credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          console.error('Auto login error after admin update:', signInError)
          return signUpData
        }

        console.log('Auto login successful after admin update:', signInData)
        
        // Force a small delay to ensure auth state is updated
        await new Promise(resolve => setTimeout(resolve, 300))
        
        return signInData
      }

      // If signup already created a session, return it
      await new Promise(resolve => setTimeout(resolve, 200))
      return signUpData
      
    } catch (error) {
      console.error('Signup process error:', error)
      throw error
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
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
