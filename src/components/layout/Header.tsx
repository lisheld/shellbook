import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/auth.service'
import { useState } from 'react'
import SpaceSwitcher from '../spaces/SpaceSwitcher'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { userProfile } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              ShellBook
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <SpaceSwitcher />
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Feed
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Profile
            </Link>

            {userProfile && (
              <div className="flex items-center space-x-4 border-l border-gray-200 pl-6 ml-2">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-semibold text-gray-900">{userProfile.displayName}</span>
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 flex flex-col space-y-3">
            <div className="py-2">
              <SpaceSwitcher />
            </div>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium py-2"
            >
              Feed
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-gray-900 transition-colors font-medium py-2"
            >
              Profile
            </Link>

            {userProfile && (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-semibold text-gray-900">{userProfile.displayName}</span>
                </span>
                <Button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900 justify-start"
                >
                  Logout
                </Button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
