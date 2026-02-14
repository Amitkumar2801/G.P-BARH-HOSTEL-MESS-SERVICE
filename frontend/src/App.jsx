import { useState } from 'react'
import axios from 'axios'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Login ka Function
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Backend se baat karo
      const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
        email: email,
        password: password
      })
      
      alert(`Welcome ${response.data.user_name}! Login Successful.`)
      console.log(response.data)
      
    } catch (error) {
      alert('Login Failed: ' + (error.response?.data?.detail || "Server Error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    // Pura Page (Blue Background)
    <div className="min-h-screen bg-gp-light flex items-center justify-center p-4">
      
      {/* Login Card */}
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md border-t-4 border-gp-blue">
        
        {/* College Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-blue-50 mb-2">
            {/* College Icon (Simple SVG) */}
            <svg className="w-12 h-12 text-gp-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">NGP-13 Login</h1>
          <p className="text-gray-500 text-sm">Government Polytechnic Barh, Patna</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gp-blue focus:border-gp-blue outline-none transition-colors"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gp-blue focus:border-gp-blue outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gp-blue text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors font-medium flex justify-center items-center"
          >
            {loading ? "Checking..." : "Login to Portal"}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          New Student? <a href="#" className="text-gp-blue font-semibold hover:underline">Register Here</a>
        </div>

      </div>
    </div>
  )
}

export default App