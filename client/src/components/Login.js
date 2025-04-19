"use client"

import { useState, useEffect } from "react"
import { TextField, Button, Container, Typography, InputAdornment, IconButton, CircularProgress } from "@mui/material"
import axios from "axios"
import { useNavigate, Link, useLocation } from "react-router-dom"
import Footer from "./Footer"

function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  // Animation keyframes
  const keyframes = `
      @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
      }
      
      @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
      }
  `

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      // Validate token before redirecting
      const validateToken = async () => {
        try {
          // Optional: You can make a lightweight API call to validate the token
          // For now, we'll just redirect to dashboard
          navigate("/dashboard")
        } catch (error) {
          // If token validation fails, clear it
          localStorage.removeItem("token")
        }
      }

      validateToken()
    }

    // Check if redirected from session expiration
    const params = new URLSearchParams(location.search)
    if (params.get("expired") === "true") {
      setError("Your session has expired. Please log in again.")
    }
  }, [navigate, location])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error when user types
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await axios.post("http://34.67.85.189:3000/api/login", form)

      if (response.data && response.data.token) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.token)

        // Configure axios defaults for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`

        // Redirect to dashboard
        navigate("/dashboard")
      } else {
        setError("Invalid response from server. Please try again.")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div style={pageStyle}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div style={overlayStyle}></div>

      <Container maxWidth="sm" style={{ position: "relative", zIndex: 2 }}>
        <div style={cardStyle}>
          {/* Logo */}
          <div style={logoContainerStyle}>
            <div style={logoStyle}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <Typography
              variant="h4"
              style={{
                fontWeight: "300",
                color: "#fff",
                marginBottom: "1rem",
                textAlign: "center",
                animation: "fadeIn 0.6s ease-out",
              }}
            >
              Welcome to HarvestHub
            </Typography>
            <Typography
              variant="body1"
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: "2rem",
                textAlign: "center",
                maxWidth: "80%",
                animation: "fadeIn 0.7s ease-out",
              }}
            >
              Sign in to your account to continue
            </Typography>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: "#f44336",
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                animation: "fadeIn 0.3s ease-out",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%", animation: "fadeIn 0.8s ease-out" }}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              name="email"
              type="email"
              onChange={handleChange}
              required
              variant="outlined"
              InputProps={{
                style: inputStyle,
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.7)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4CAF50",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              onChange={handleChange}
              required
              variant="outlined"
              InputProps={{
                style: inputStyle,
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.7)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                style: {
                  color: "rgba(255, 255, 255, 0.7)",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4CAF50",
                  },
                },
              }}
            />

            <div style={{ textAlign: "right", marginTop: "8px", marginBottom: "20px" }}>
              <Link
                to="/forgot-password"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#4CAF50")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.7)")}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "500",
                textTransform: "none",
                boxShadow: "0 4px 10px rgba(76, 175, 80, 0.3)",
                transition: "all 0.3s ease",
                marginBottom: "20px",
              }}
              sx={{
                "&:hover": {
                  backgroundColor: "#3d8b40",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(76, 175, 80, 0.4)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
              }}
            >
              <span>Don't have an account?</span>
              <Link
                to="/register"
                style={{
                  color: "#4CAF50",
                  textDecoration: "none",
                  marginLeft: "5px",
                  fontWeight: "500",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#3d8b40")}
                onMouseLeave={(e) => (e.target.style.color = "#4CAF50")}
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </Container>

      <Footer />
    </div>
  )
}

// Styles
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundImage:
    "url('https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  padding: "40px 0",
}

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  zIndex: 1,
}

const cardStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(10px)",
  borderRadius: "16px",
  padding: "40px",
  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.3)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  animation: "fadeIn 0.5s ease-out",
}

const logoContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "20px",
  width: "100%",
}

const logoStyle = {
  width: "80px",
  height: "80px",
  backgroundColor: "rgba(76, 175, 80, 0.1)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
  border: "1px solid rgba(76, 175, 80, 0.3)",
  boxShadow: "0 5px 15px rgba(76, 175, 80, 0.2)",
  animation: "float 3s ease-in-out infinite",
}

const inputStyle = {
  color: "white",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "8px",
}

export default Login

