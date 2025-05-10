// import React, { useState } from "react";
// import { TextField, Button, Container, Typography } from "@mui/material";
// import axios from "axios";
// import Footer from "./Footer";

// function Register() {
//     const [form, setForm] = useState({ username: "", email: "", password: "" });

//     const handleChange = (e) => {
//         setForm({ ...form, [e.target.name]: e.target.value });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         try {
//             const response = await axios.post("http://localhost:8080/api/register", form); // Backend is on port 8080
//             alert(response.data.message);
//         } catch (error) {
//             console.error("Error:", error);
//             alert("Registration failed. Please try again.");
//         }
//     };

//     return (
//         <Container maxWidth="sm">
//             <Typography variant="h4">Register</Typography>
//             <form onSubmit={handleSubmit}>
//                 <TextField
//                     fullWidth
//                     margin="normal"
//                     label="Username"
//                     name="username"
//                     onChange={handleChange}
//                     required
//                 />
//                 <TextField
//                     fullWidth
//                     margin="normal"
//                     label="Email"
//                     name="email"
//                     type="email"
//                     onChange={handleChange}
//                     required
//                 />
//                 <TextField
//                     fullWidth
//                     margin="normal"
//                     label="Password"
//                     name="password"
//                     type="password"
//                     onChange={handleChange}
//                     required
//                 />
//                 <Button type="submit" variant="contained" color="primary" fullWidth>
//                     Register
//                 </Button>
//             </form>
//             <Footer/>
//         </Container>
//     );
// }

// export default Register;

"use client"

import { useState, useEffect } from "react"
import { TextField, Button, Container, Typography, InputAdornment, IconButton, CircularProgress } from "@mui/material"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"
import Footer from "./Footer"

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const navigate = useNavigate()

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
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      navigate("/dashboard")
    }
  }, [navigate])

  // Check password strength
  useEffect(() => {
    if (!form.password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0

    // Length check
    if (form.password.length >= 8) strength += 1

    // Contains number
    if (/\d/.test(form.password)) strength += 1

    // Contains lowercase
    if (/[a-z]/.test(form.password)) strength += 1

    // Contains uppercase
    if (/[A-Z]/.test(form.password)) strength += 1

    // Contains special character
    if (/[^A-Za-z0-9]/.test(form.password)) strength += 1

    setPasswordStrength(strength)
  }, [form.password])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error when user types
    if (error) setError("")
  }

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value)
    if (error) setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate passwords match
    if (form.password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Validate password strength
    if (passwordStrength < 3) {
      setError("Please use a stronger password")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await axios.post("http://34.67.85.189:3000/api/register", form)
      setSuccess(response.data.message || "Registration successful! You can now log in.")

      // Reset form
      setForm({ username: "", email: "", password: "" })
      setConfirmPassword("")

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      console.error("Registration error:", error)
      setError(error.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "#f44336" // Weak - Red
    if (passwordStrength <= 3) return "#ff9800" // Medium - Orange
    return "#4caf50" // Strong - Green
  }

  const getPasswordStrengthText = () => {
    if (!form.password) return ""
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 3) return "Medium"
    return "Strong"
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
              Create an Account
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
              Join HarvestHub to start trading seasonal products
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
                width: "100%",
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

          {/* Success message */}
          {success && (
            <div
              style={{
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                color: "#4caf50",
                padding: "10px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                animation: "fadeIn 0.3s ease-out",
                width: "100%",
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: "100%", animation: "fadeIn 0.8s ease-out" }}>
            <TextField
              fullWidth
              margin="normal"
              label="Username"
              name="username"
              value={form.username}
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
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
              label="Email"
              name="email"
              type="email"
              value={form.email}
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
              value={form.password}
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

            {/* Password strength indicator */}
            {form.password && (
              <div style={{ marginTop: "5px", marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "5px", width: "70%" }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        style={{
                          height: "4px",
                          flex: 1,
                          backgroundColor:
                            passwordStrength >= level ? getPasswordStrengthColor() : "rgba(255, 255, 255, 0.1)",
                          borderRadius: "2px",
                          transition: "background-color 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <Typography
                    variant="caption"
                    style={{
                      color: getPasswordStrengthColor(),
                      fontWeight: "500",
                    }}
                  >
                    {getPasswordStrengthText()}
                  </Typography>
                </div>
                <Typography
                  variant="caption"
                  style={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "0.7rem",
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  Use 8+ characters with a mix of letters, numbers & symbols
                </Typography>
              </div>
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Confirm Password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
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
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
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
              error={confirmPassword && form.password !== confirmPassword}
              helperText={confirmPassword && form.password !== confirmPassword ? "Passwords don't match" : ""}
              FormHelperTextProps={{
                style: {
                  color: "#f44336",
                  marginLeft: "0",
                  fontSize: "0.75rem",
                },
              }}
            />

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
                marginTop: "20px",
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
            </Button>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.875rem",
              }}
            >
              <span>Already have an account?</span>
              <Link
                to="/login"
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
                Sign in
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

export default Register
