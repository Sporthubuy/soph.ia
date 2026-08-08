import type { SupabaseClient } from '@supabase/supabase-js'

export type AuthError = {
  message: string
  status?: number
}

export async function signUpWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    // Sign up the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      return {
        success: false,
        error: {
          message: signUpError.message || 'Error al registrarse',
          status: signUpError.status,
        },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: { message: 'No se pudo crear la cuenta' },
      }
    }

    // Create profile entry
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email!,
      full_name: fullName,
      initials: fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Profile creation error is not fatal - auth succeeded
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
    }
  }
}

export async function signInWithEmail(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: {
          message: error.message || 'Error al iniciar sesión',
          status: error.status,
        },
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: { message: 'No se pudo iniciar sesión' },
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
    }
  }
}

export async function signOut(supabase: SupabaseClient): Promise<{ success: boolean; error?: AuthError }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: { message: error.message || 'Error al cerrar sesión' },
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Error desconocido',
      },
    }
  }
}

export async function getCurrentUser(supabase: SupabaseClient) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}
