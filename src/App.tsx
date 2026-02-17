import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SpaceProvider } from './context/SpaceContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import LoginForm from './components/auth/LoginForm'
import SignUpForm from './components/auth/SignUpForm'
import CreateFirstSpace from './components/spaces/CreateFirstSpace'
import Header from './components/layout/Header'
import PhotoFeed from './components/feed/PhotoFeed'
import ProfilePage from './components/profile/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SpaceProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route
                path="/create-first-space"
                element={
                  <ProtectedRoute>
                    <CreateFirstSpace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Header />
                    <PhotoFeed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Header />
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SpaceProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
