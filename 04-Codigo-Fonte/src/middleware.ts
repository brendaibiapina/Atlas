import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin'

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Public routes must not wait for Supabase auth checks.
    const isApiRoute = pathname.startsWith('/api')
    const isSuccessRoute = pathname.startsWith('/sucesso')
    const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin')
    const isAdminRoute = pathname.startsWith('/admin')
    const isAuthRoute = pathname.startsWith('/login')

    if (!isProtectedRoute && !isAuthRoute) {
        return response
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        if (isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
        return response
    }

    // API routes and success page do not need auth redirect logic.
    if (isApiRoute || isSuccessRoute) {
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    let user: { email?: string | null } | null = null
    try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
            console.error('Middleware Auth error:', error.message)
        }
        user = data?.user ?? null
    } catch (err) {
        console.error('Middleware Auth exception:', err)
        user = null
    }

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAdminRoute && user && !isAdminEmail(user.email)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
