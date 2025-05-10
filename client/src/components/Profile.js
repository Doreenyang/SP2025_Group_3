"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Sidebar from "./Sidebar"
import TabsComponent from "./Tabs"
import Message from "./Message"
import { MessageCircle } from "lucide-react"
import Footer from "./Footer"
import { jwtDecode } from "jwt-decode"

function Profile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("products")
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [products, setProducts] = useState([])
  const [pendingTrades, setPendingTrades] = useState([])
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [notification, setNotification] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalProducts: 0,
    pendingRequests: 0,
    completedTrades: 0,
  })
  const [showMessages, setShowMessages] = useState(false)
  const [userId, setUserId] = useState(null)

  // Get user ID from token
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded = jwtDecode(token)
        if (decoded && decoded.id) {
          setUserId(decoded.id)
        }
      } catch (error) {
        console.error("Error decoding token:", error)
      }
    }
  }, [])

  // Simplified approach: fetch user profile and products in one useEffect
  const fetchUserDataAndProducts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")

      if (!token) {
        alert("Unauthorized! Redirecting to login.")
        navigate("/login")
        return
      }

      // First, try to get the user ID directly from the token
      let currentUserId = null
      try {
        const decoded = jwtDecode(token)
        if (decoded && decoded.id) {
          currentUserId = decoded.id
          setUserId(decoded.id)
          console.log("User ID from token:", decoded.id)
        }
      } catch (tokenError) {
        console.error("Error decoding token:", tokenError)
      }

      // If we couldn't get the user ID from the token, try the profile API
      if (!currentUserId) {
        try {
          const profileResponse = await axios.get("http://34.67.85.189:3000/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          })

          const userId =
            profileResponse.data.id ||
            profileResponse.data.user_id ||
            profileResponse.data._id ||
            profileResponse.data.userId

          if (userId) {
            currentUserId = userId
            setUserId(userId)
          }
        } catch (profileError) {
          console.error("Error fetching profile:", profileError)
          // Continue with other requests even if profile fetch fails
        }
      }

      {/* Welcome message instead of username */}
        {<h2
          style={{
            margin: "0 0 5px 0",
            fontSize: "1.5rem",
            fontWeight: "400",
            animation: "fadeIn 0.6s ease-out",
          }}
        >
          Welcome Back!
        </h2>}

      // Get all products regardless of whether we have the user ID
      try {
        // Try to get all products
        const productsResponse = await axios.get("http://34.67.85.189:3000/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("All products response:", productsResponse.data)

        // If we have a user ID, filter the products
        if (currentUserId) {
          let userProducts = []

          if (Array.isArray(productsResponse.data)) {
            userProducts = productsResponse.data.filter((product) => {
              const productOwnerId =
                product.owner_id || product.user_id || product.userId || product.ownerId || product.created_by

              return String(productOwnerId) === String(currentUserId)
            })
          } else if (productsResponse.data && typeof productsResponse.data === "object") {
            const productsArray = productsResponse.data.products || []
            userProducts = productsArray.filter((product) => {
              const productOwnerId =
                product.owner_id || product.user_id || product.userId || product.ownerId || product.created_by
              return String(productOwnerId) === String(currentUserId)
            })
          }

          console.log("Filtered user products:", userProducts)
          setProducts(
            userProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          )
          
          setUserStats((prev) => ({
            ...prev,
            totalProducts: userProducts.length,
          }))
        } else {
          // If we don't have a user ID, just set all products
          const allProducts = Array.isArray(productsResponse.data)
            ? productsResponse.data
            : productsResponse.data?.products || []

            setProducts(
                allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              )
              
          setUserStats((prev) => ({
            ...prev,
            totalProducts: allProducts.length,
          }))
        }
      } catch (productsError) {
        console.error("Error fetching products:", productsError)
        setProducts([])
      }

      // Try to get pending trades
      try {
        const tradesResponse = await axios.get("http://34.67.85.189:3000/api/trade/pending", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const pendingTradesData = Array.isArray(tradesResponse.data)
          ? tradesResponse.data
          : tradesResponse.data?.trades || []

        // If we have a user ID, filter the trades
        if (currentUserId) {
          const userTrades = pendingTradesData.filter((trade) => {
            const tradeReceiverId = trade.receiver_id || trade.receiverId
            return String(tradeReceiverId) === String(currentUserId)
          })

          setPendingTrades(userTrades)
          setUserStats((prev) => ({
            ...prev,
            pendingRequests: userTrades.length || 0,
          }))
        } else {
          setPendingTrades(pendingTradesData)
          setUserStats((prev) => ({
            ...prev,
            pendingRequests: pendingTradesData.length || 0,
          }))
        }
      } catch (tradeError) {
        console.error("Error fetching pending trades:", tradeError)
        // Try alternative endpoint
        try {
          const altTradesResponse = await axios.get("http://34.67.85.189:3000/api/trades/pending", {
            headers: { Authorization: `Bearer ${token}` },
          })

          const pendingTradesData = Array.isArray(altTradesResponse.data)
            ? altTradesResponse.data
            : altTradesResponse.data?.trades || []

          // If we have a user ID, filter the trades
          if (currentUserId) {
            const userTrades = pendingTradesData.filter((trade) => {
              const tradeReceiverId = trade.receiver_id || trade.receiverId
              return String(tradeReceiverId) === String(currentUserId)
            })

            setPendingTrades(userTrades)
            setUserStats((prev) => ({
              ...prev,
              pendingRequests: userTrades.length || 0,
            }))
          } else {
            setPendingTrades(pendingTradesData)
            setUserStats((prev) => ({
              ...prev,
              pendingRequests: pendingTradesData.length || 0,
            }))
          }
        } catch (altError) {
          console.error("Error fetching from alternative trades endpoint:", altError)
          setPendingTrades([])
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDataAndProducts()
  }, [navigate])

  const getTimeSinceListed = (createdAt) => {
    const createdDate = new Date(createdAt)
    const now = new Date()
    const timeDiff = Math.floor((now - createdDate) / 1000) // Difference in seconds

    if (timeDiff < 60) {
      return `${timeDiff} seconds ago`
    } else if (timeDiff < 3600) {
      return `${Math.floor(timeDiff / 60)} minutes ago`
    } else if (timeDiff < 86400) {
      return `${Math.floor(timeDiff / 3600)} hours ago`
    } else if (timeDiff < 604800) {
      return `${Math.floor(timeDiff / 86400)} days ago`
    } else if (timeDiff < 2629800) {
      // Approx. 1 month
      return `${Math.floor(timeDiff / 604800)} weeks ago`
    } else if (timeDiff < 31557600) {
      // Approx. 1 year
      return `${Math.floor(timeDiff / 2629800)} months ago`
    } else {
      return `${Math.floor(timeDiff / 31557600)} years ago`
    }
  }

  const handleTradeRequestAction = async (tradeId, action) => {
    try {
      const token = localStorage.getItem("token")

      // Log the action for debugging
      console.log(`Attempting to ${action} trade with ID: ${tradeId}`)

      const response = await axios.post(
        `http://34.67.85.189:3000/api/trade/${action}/${tradeId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Show notification instead of alert
      setNotification({
        message: `Trade request ${action}ed successfully.`,
        type: "success",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)

      console.log("Trade action response:", response.data)




      // Refresh the pending trades list
      try {
        const updatedTradesResponse = await axios.get("http://34.67.85.189:3000/api/trade/pending", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const pendingTradesData = Array.isArray(updatedTradesResponse.data) ? updatedTradesResponse.data : []
        setPendingTrades(pendingTradesData)

        // Update stats
        setUserStats((prev) => ({
          ...prev,
          pendingRequests: pendingTradesData.length || 0,
          completedTrades: action === "accept" ? prev.completedTrades + 1 : prev.completedTrades,
        }))
      } catch (error) {
        console.error("Error refreshing pending trades:", error)
        // Try alternative endpoint
        try {
          const altTradesResponse = await axios.get("http://34.67.85.189:3000/api/trades/pending", {
            headers: { Authorization: `Bearer ${token}` },
          })

          const pendingTradesData = Array.isArray(altTradesResponse.data) ? altTradesResponse.data : []
          setPendingTrades(pendingTradesData)

          // Update stats
          setUserStats((prev) => ({
            ...prev,
            pendingRequests: pendingTradesData.length || 0,
            completedTrades: action === "accept" ? prev.completedTrades + 1 : prev.completedTrades,
          }))
        } catch (altError) {
          console.error("Error fetching from alternative trades endpoint:", altError)
          // If both fail, just remove the trade that was actioned from the current list
          setPendingTrades((prevTrades) => prevTrades.filter((trade) => (trade.id || trade._id) !== tradeId))
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing trade request:`, error)
      setNotification({
        message: `Failed to ${action} trade request. Please try again.`,
        type: "error",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setNotification({
          message: "Unauthorized! Redirecting to login.",
          type: "error",
        })
        setTimeout(() => {
          navigate("/login")
        }, 2000)
        return
      }

      const response = await axios.put(
        "http://34.67.85.189:3000/api/update-profile",
        {
          username,
          email,
          currentPassword,
          newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.status === 200) {
        setNotification({
          message: "Profile updated successfully!",
          type: "success",
        })

        // Clear form fields
        setCurrentPassword("")
        setNewPassword("")
      } else {
        setNotification({
          message: response.data.message || "Update failed.",
          type: "error",
        })
      }

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setNotification({
        message: "Failed to update profile.",
        type: "error",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const handleUpdateField = async (field, value) => {
    if (!value) {
      setNotification({
        message: `${field} cannot be empty.`,
        type: "error",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setNotification({
          message: "Unauthorized! Redirecting to login.",
          type: "error",
        })
        setTimeout(() => {
          navigate("/login")
        }, 2000)
        return
      }

      const response = await axios.put(
        "http://34.67.85.189:3000/api/update-profile",
        { field, value },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.status === 200) {
        setNotification({
          message: `${field} updated successfully!`,
          type: "success",
        })
      } else {
        setNotification({
          message: response.data.message || "Update failed.",
          type: "error",
        })
      }

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      setNotification({
        message: `Failed to update ${field}.`,
        type: "error",
      })

      setTimeout(() => {
        setNotification(null)
      }, 3000)
    }
  }

  const getSeasonColor = (season) => {
    switch (season?.toLowerCase()) {
      case "spring":
        return "#a8e6cf"
      case "summer":
        return "#ffdfba"
      case "autumn":
        return "#ffb7b2"
      case "winter":
        return "#b5c9df"
      default:
        return "#a0a0a0"
    }
  }

  const getSeasonIcon = (season) => {
    switch (season?.toLowerCase()) {
      case "spring":
        return "🌱"
      case "summer":
        return "☀️"
      case "autumn":
        return "🍂"
      case "winter":
        return "❄️"
      default:
        return "🌐"
    }
  }

  if (loading) {
    return (
      <div style={profilePageStyle}>
        <div style={overlayStyle}></div>
        <TabsComponent />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem",
              borderRadius: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                border: "3px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "50%",
                borderTopColor: "#ffffff",
                animation: "spin 1s linear infinite",
                marginBottom: "1rem",
              }}
            ></div>
            <h2 style={{ color: "#fff", margin: "0" }}>Loading Profile...</h2>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={profilePageStyle}>
      <div style={overlayStyle}></div>
      <TabsComponent />
      <div style={{ display: "flex", paddingTop: "64px" }}>
        <Sidebar onManageProfileClick={() => setShowEditProfile(true)} />
        <div style={contentStyle}>
          {!showEditProfile ? (
            <>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: "300",
                  marginBottom: "2rem",
                  textAlign: "center",
                  animation: "fadeIn 0.6s ease-out",
                  color: "#fff",
                }}
              >
                Welcome to your Profile!
              </h1>
              {/* Profile Stats Section */}
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "2rem",
                  animation: "fadeIn 0.5s ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "1.5rem",
                    width: "100%",
                    maxWidth: "1000px",
                  }}
                >
                  <div
                    style={{
                      flex: "1 1 200px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      textAlign: "center",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)"
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Total Products</h3>
                    <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.totalProducts}</p>
                  </div>

                  <div
                    style={{
                      flex: "1 1 200px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      textAlign: "center",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)"
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⏳</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Pending Requests</h3>
                    <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.pendingRequests}</p>
                  </div>

                  <div
                    style={{
                      flex: "1 1 200px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      textAlign: "center",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)"
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
                    }}
                  >
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🤝</div>
                    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Completed Trades</h3>
                    <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.completedTrades}</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "2rem",
                  width: "100%",
                  animation: "fadeIn 0.6s ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "30px",
                    padding: "0.5rem",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <button
                    onClick={() => setActiveTab("products")}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "25px",
                      border: "none",
                      backgroundColor: activeTab === "products" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: activeTab === "products" ? "500" : "400",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Your Products
                  </button>
                  <button
                    onClick={() => setActiveTab("trades")}
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "25px",
                      border: "none",
                      backgroundColor: activeTab === "trades" ? "rgba(255, 255, 255, 0.2)" : "transparent",
                      color: "#fff",
                      fontSize: "1rem",
                      fontWeight: activeTab === "trades" ? "500" : "400",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                  >
                    Pending Trades
                  </button>
                </div>
              </div>

              {/* Your Products Tab */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  animation: activeTab === "products" ? "fadeInUp 0.7s ease-out" : "fadeInUp 0.7s ease-out",
                  display: activeTab === "products" ? "block" : "none",
                }}
              >
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "300",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  Your Products
                </h2>

                {products.length > 0 ? (
                  <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Image</th>
                          <th style={tableHeaderStyle}>Product Name</th>
                          <th style={tableHeaderStyle}>Season</th>
                          <th style={tableHeaderStyle}>Description</th>
                          <th style={tableHeaderStyle}>Listed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} style={tableRowStyle}>
                            <td>
                              {product.product_image ? (
                                <img
                                  src={`http://34.67.85.189:3000/${product.product_image}`}
                                  alt={product.product_name}
                                  style={imageStyle}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "75px",
                                    height: "75px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                                    borderRadius: "10px",
                                    fontSize: "2rem",
                                  }}
                                >
                                  {getSeasonIcon(product.suitable_season)}
                                </div>
                              )}
                            </td>
                            <td style={{ fontWeight: "500" }}>{product.product_name}</td>
                            <td>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 10px",
                                  backgroundColor: getSeasonColor(product.suitable_season),
                                  color: "#fff",
                                  borderRadius: "20px",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {product.suitable_season}
                              </span>
                            </td>
                            <td
                              style={{
                                maxWidth: "300px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.product_description}
                            </td>
                            <td>{getTimeSinceListed(product.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "3rem 2rem",
                      textAlign: "center",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      margin: "0 1rem",
                    }}
                  >
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "300", marginBottom: "1rem" }}>
                      You haven't listed any products yet
                    </h3>
                    <p style={{ color: "rgba(255, 255, 255, 0.8)", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
                      Start listing your seasonal products to trade with others in the community.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard")}
                      style={{
                        padding: "0.8rem 1.5rem",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "30px",
                        fontSize: "1rem",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                        e.currentTarget.style.transform = "translateY(0)"
                      }}
                    >
                      Go to Dashboard
                    </button>
                  </div>
                )}
              </div>

              {/* Pending Trades Tab */}
              <div
                style={{
                  width: "100%",
                  maxWidth: "1200px",
                  animation: "fadeInUp 0.7s ease-out",
                  display: activeTab === "trades" ? "block" : "none",
                }}
              >
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: "300",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                    color: "#fff",
                  }}
                >
                  Pending Trade Requests
                </h2>

                {pendingTrades.length > 0 ? (
                  <div style={tableContainerStyle}>
                    <table style={tableStyle}>
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>Trade ID</th>
                          <th style={tableHeaderStyle}>Requested Item</th>
                          <th style={tableHeaderStyle}>Coins Offered</th>
                          <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTrades.map((trade, index) => (
                          <tr key={trade.id || trade._id || index} style={tableRowStyle}>
                            <td style={{ fontWeight: "500" }}>{trade.id || trade._id || "N/A"}</td>
                            {/* <td>
                              {trade.requested_item_id || trade.requestedItemId || trade.productName || "Unknown Item"}
                            </td> */}
                            <td>
  {(() => {
    const product = products.find(p => p.id === trade.requested_item_id || p.id === trade.requestedItemId);
    return product?.product_image ? (
      <img
        src={`http://34.67.85.189:3000/${product.product_image}`}
        alt={product.product_name}
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
    ) : (
      "Image not found"
    );
  })()}
</td>

                            <td>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "5px 15px",
                                  backgroundColor: "rgba(255, 193, 7, 0.2)",
                                  color: "#FFC107",
                                  borderRadius: "20px",
                                  fontWeight: "bold",
                                }}
                              >
                                {trade.coins_offered || trade.coinsOffered || 0} coins
                              </span>
                            </td>
                            <td>
                              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleTradeRequestAction(trade.id || trade._id, "accept")}
                                  style={{
                                    padding: "8px 16px",
                                    backgroundColor: "rgba(76, 175, 80, 0.2)",
                                    color: "#4CAF50",
                                    border: "1px solid rgba(76, 175, 80, 0.3)",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.3)"
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.2)"
                                  }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleTradeRequestAction(trade.id || trade._id, "decline")}
                                  style={{
                                    padding: "8px 16px",
                                    backgroundColor: "rgba(244, 67, 54, 0.2)",
                                    color: "#f44336",
                                    border: "1px solid rgba(244, 67, 54, 0.3)",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(244, 67, 54, 0.3)"
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(244, 67, 54, 0.2)"
                                  }}
                                >
                                  Decline
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "12px",
                      padding: "3rem 2rem",
                      textAlign: "center",
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      margin: "0 1rem",
                    }}
                  >
                    <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
                    <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "300", marginBottom: "1rem" }}>
                      No pending trade requests
                    </h3>
                    <p style={{ color: "rgba(255, 255, 255, 0.8)", maxWidth: "500px", margin: "0 auto" }}>
                      When someone wants to trade for one of your products, the request will appear here.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                animation: "scaleIn 0.5s ease-out",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "2.5rem",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "2rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: "300",
                      color: "#fff",
                      margin: 0,
                    }}
                  >
                    Edit Your Profile
                  </h2>

                  <button
                    onClick={() => setShowEditProfile(false)}
                    style={{
                      backgroundColor: "transparent",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "30px",
                      padding: "0.6rem 1.2rem",
                      color: "#fff",
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Username
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "0.8rem 1rem",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "1rem",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                        }}
                        placeholder="Enter username"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateField("username", username)}
                        style={{
                          padding: "0.8rem 1.2rem",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Email
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "0.8rem 1rem",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "1rem",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                        }}
                        placeholder="Enter email"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateField("email", email)}
                        style={{
                          padding: "0.8rem 1.2rem",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontSize: "0.9rem",
                      }}
                    >
                      New Password
                    </label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                      }}
                    >
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "0.8rem 1rem",
                          backgroundColor: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "1rem",
                          outline: "none",
                          transition: "all 0.3s ease",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
                          e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
                        }}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateField("password", newPassword)}
                        style={{
                          padding: "0.8rem 1.2rem",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Message Button */}
      {/* <button
        onClick={() => setShowMessages(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          zIndex: 100,
        }}
      >
        <MessageCircle size={24} />
      </button> */}

      {/* Messages Modal */}
      {showMessages && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "80%",
              height: "80%",
              borderRadius: "10px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Message userId={userId} onClose={() => setShowMessages(false)} />
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            backgroundColor: notification.type === "success" ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)",
            color: "#fff",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            animation: "fadeInUp 0.3s ease-out",
          }}
        >
          {notification.type === "success" ? (
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
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {notification.message}
        </div>
      )}

      <Footer />
    </div>
  )
}

// Styles
const profilePageStyle = {
  backgroundImage:
    "url('https://images.unsplash.com/photo-1658227387870-6b7d4d6ff031?q=80&w=3200&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "fixed",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  position: "relative",
  zIndex: 1,
}

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  zIndex: -1,
}

const contentStyle = {
  marginLeft: "5px",
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  color: "#fff",
  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
  fontFamily: "'Poppins', sans-serif",
}

// Table container with better spacing
const tableContainerStyle = {
  width: "100%",
  marginTop: "20px",
  display: "flex",
  justifyContent: "center",
}

// Table styling with better column spacing
const tableStyle = {
  width: "85%",
  borderCollapse: "separate",
  borderSpacing: "0 12px", // Adds spacing between rows
  textAlign: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)", // Lightened glassmorphism effect
  backdropFilter: "blur(10px)",
  borderRadius: "12px",
  overflow: "hidden",
  color: "#fff",
  padding: "15px",
  boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.25)", // Deeper shadow for depth
}

// Header row with modern styling
const tableHeaderStyle = {
  background: "rgba(0, 0, 0, 0.3)", // Darker header for contrast
  color: "#fff",
  fontSize: "1rem",
  padding: "15px",
  textAlign: "center",
  fontWeight: "400",
}

// Table row styling with increased row height
const tableRowStyle = {
  height: "80px", // More row height for spacing
  transition: "all 0.3s ease-in-out",
  textAlign: "center",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  borderRadius: "8px",
}

// Image styling
const imageStyle = {
  width: "75px",
  height: "75px",
  borderRadius: "10px",
  objectFit: "cover",
  transition: "transform 0.3s ease-in-out",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
  margin: "5px auto",
}

export default Profile



// "use client"

// import { useEffect, useState } from "react"
// import { useNavigate } from "react-router-dom"
// import axios from "axios"
// import Sidebar from "./Sidebar"
// import TabsComponent from "./Tabs"
// import Message from "./Message"
// import { MessageCircle } from "lucide-react"
// import Footer from "./Footer"
// import { jwtDecode } from "jwt-decode"

// function Profile() {
//   const navigate = useNavigate()
//   const [activeTab, setActiveTab] = useState("products")
//   const [showEditProfile, setShowEditProfile] = useState(false)
//   const [products, setProducts] = useState([])
//   const [pendingTrades, setPendingTrades] = useState([])
//   const [username, setUsername] = useState("")
//   const [email, setEmail] = useState("")
//   const [currentPassword, setCurrentPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const [notification, setNotification] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [userStats, setUserStats] = useState({
//     totalProducts: 0,
//     pendingRequests: 0,
//     completedTrades: 0,
//   })
//   const [showMessages, setShowMessages] = useState(false)
//   const [userId, setUserId] = useState(null)

//   // Get user ID from token
//   useEffect(() => {
//     const token = localStorage.getItem("token")
//     if (token) {
//       try {
//         const decoded = jwtDecode(token)
//         if (decoded && decoded.id) {
//           setUserId(decoded.id)
//         }
//       } catch (error) {
//         console.error("Error decoding token:", error)
//       }
//     }
//   }, [])

//   // Simplified approach: fetch user profile and products in one useEffect
//   const fetchUserDataAndProducts = async () => {
//     try {
//       setLoading(true)
//       const token = localStorage.getItem("token")

//       if (!token) {
//         alert("Unauthorized! Redirecting to login.")
//         navigate("/login")
//         return
//       }

//       // First, try to get the user ID directly from the token
//       let currentUserId = null
//       try {
//         const decoded = jwtDecode(token)
//         if (decoded && decoded.id) {
//           currentUserId = decoded.id
//           setUserId(decoded.id)
//           console.log("User ID from token:", decoded.id)
//         }
//       } catch (tokenError) {
//         console.error("Error decoding token:", tokenError)
//       }

//       // If we couldn't get the user ID from the token, try the profile API
//       if (!currentUserId) {
//         try {
//           const profileResponse = await axios.get("http://localhost:8080/api/profile", {
//             headers: { Authorization: `Bearer ${token}` },
//           })

//           const userId =
//             profileResponse.data.id ||
//             profileResponse.data.user_id ||
//             profileResponse.data._id ||
//             profileResponse.data.userId

//           if (userId) {
//             currentUserId = userId
//             setUserId(userId)
//           }
//         } catch (profileError) {
//           console.error("Error fetching profile:", profileError)
//           // Continue with other requests even if profile fetch fails
//         }
//       }

//       // Get all products regardless of whether we have the user ID
//       try {
//         // Try to get all products
//         const productsResponse = await axios.get("http://localhost:8080/api/products", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         console.log("All products response:", productsResponse.data)

//         // If we have a user ID, filter the products
//         if (currentUserId) {
//           let userProducts = []

//           if (Array.isArray(productsResponse.data)) {
//             userProducts = productsResponse.data.filter((product) => {
//               const productOwnerId =
//                 product.owner_id || product.user_id || product.userId || product.ownerId || product.created_by

//               return String(productOwnerId) === String(currentUserId)
//             })
//           } else if (productsResponse.data && typeof productsResponse.data === "object") {
//             const productsArray = productsResponse.data.products || []
//             userProducts = productsArray.filter((product) => {
//               const productOwnerId =
//                 product.owner_id || product.user_id || product.userId || product.ownerId || product.created_by
//               return String(productOwnerId) === String(currentUserId)
//             })
//           }

//           console.log("Filtered user products:", userProducts)
//           setProducts(
//             userProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//           )
          
//           setUserStats((prev) => ({
//             ...prev,
//             totalProducts: userProducts.length,
//           }))
//         } else {
//           // If we don't have a user ID, just set all products
//           const allProducts = Array.isArray(productsResponse.data)
//             ? productsResponse.data
//             : productsResponse.data?.products || []

//             setProducts(
//                 allProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
//               )
              
//           setUserStats((prev) => ({
//             ...prev,
//             totalProducts: allProducts.length,
//           }))
//         }
//       } catch (productsError) {
//         console.error("Error fetching products:", productsError)
//         setProducts([])
//       }

//       // Try to get pending trades
//       try {
//         const tradesResponse = await axios.get("http://localhost:8080/api/trade/pending", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         const pendingTradesData = Array.isArray(tradesResponse.data)
//           ? tradesResponse.data
//           : tradesResponse.data?.trades || []

//         // If we have a user ID, filter the trades
//         if (currentUserId) {
//           const userTrades = pendingTradesData.filter((trade) => {
//             const tradeReceiverId = trade.receiver_id || trade.receiverId
//             return String(tradeReceiverId) === String(currentUserId)
//           })

//           setPendingTrades(userTrades)
//           setUserStats((prev) => ({
//             ...prev,
//             pendingRequests: userTrades.length || 0,
//           }))
//         } else {
//           setPendingTrades(pendingTradesData)
//           setUserStats((prev) => ({
//             ...prev,
//             pendingRequests: pendingTradesData.length || 0,
//           }))
//         }
//       } catch (tradeError) {
//         console.error("Error fetching pending trades:", tradeError)
//         // Try alternative endpoint
//         try {
//           const altTradesResponse = await axios.get("http://localhost:8080/api/trades/pending", {
//             headers: { Authorization: `Bearer ${token}` },
//           })

//           const pendingTradesData = Array.isArray(altTradesResponse.data)
//             ? altTradesResponse.data
//             : altTradesResponse.data?.trades || []

//           // If we have a user ID, filter the trades
//           if (currentUserId) {
//             const userTrades = pendingTradesData.filter((trade) => {
//               const tradeReceiverId = trade.receiver_id || trade.receiverId
//               return String(tradeReceiverId) === String(currentUserId)
//             })

//             setPendingTrades(userTrades)
//             setUserStats((prev) => ({
//               ...prev,
//               pendingRequests: userTrades.length || 0,
//             }))
//           } else {
//             setPendingTrades(pendingTradesData)
//             setUserStats((prev) => ({
//               ...prev,
//               pendingRequests: pendingTradesData.length || 0,
//             }))
//           }
//         } catch (altError) {
//           console.error("Error fetching from alternative trades endpoint:", altError)
//           setPendingTrades([])
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching user data:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchUserDataAndProducts()
//   }, [navigate])

//   const getTimeSinceListed = (createdAt) => {
//     const createdDate = new Date(createdAt)
//     const now = new Date()
//     const timeDiff = Math.floor((now - createdDate) / 1000) // Difference in seconds

//     if (timeDiff < 60) {
//       return `${timeDiff} seconds ago`
//     } else if (timeDiff < 3600) {
//       return `${Math.floor(timeDiff / 60)} minutes ago`
//     } else if (timeDiff < 86400) {
//       return `${Math.floor(timeDiff / 3600)} hours ago`
//     } else if (timeDiff < 604800) {
//       return `${Math.floor(timeDiff / 86400)} days ago`
//     } else if (timeDiff < 2629800) {
//       // Approx. 1 month
//       return `${Math.floor(timeDiff / 604800)} weeks ago`
//     } else if (timeDiff < 31557600) {
//       // Approx. 1 year
//       return `${Math.floor(timeDiff / 2629800)} months ago`
//     } else {
//       return `${Math.floor(timeDiff / 31557600)} years ago`
//     }
//   }

//   const handleTradeRequestAction = async (tradeId, action) => {
//     try {
//       const token = localStorage.getItem("token")

//       // Log the action for debugging
//       console.log(`Attempting to ${action} trade with ID: ${tradeId}`)

//       const response = await axios.post(
//         `http://localhost:8080/api/trade/${action}/${tradeId}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       )

//       // Show notification instead of alert
//       setNotification({
//         message: `Trade request ${action}ed successfully.`,
//         type: "success",
//       })

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)

//       console.log("Trade action response:", response.data)

//       // Refresh the pending trades list
//       try {
//         const updatedTradesResponse = await axios.get("http://localhost:8080/api/trade/pending", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         const pendingTradesData = Array.isArray(updatedTradesResponse.data) ? updatedTradesResponse.data : []
//         setPendingTrades(pendingTradesData)

//         // Update stats
//         setUserStats((prev) => ({
//           ...prev,
//           pendingRequests: pendingTradesData.length || 0,
//           completedTrades: action === "accept" ? prev.completedTrades + 1 : prev.completedTrades,
//         }))
//       } catch (error) {
//         console.error("Error refreshing pending trades:", error)
//         // Try alternative endpoint
//         try {
//           const altTradesResponse = await axios.get("http://localhost:8080/api/trades/pending", {
//             headers: { Authorization: `Bearer ${token}` },
//           })

//           const pendingTradesData = Array.isArray(altTradesResponse.data) ? altTradesResponse.data : []
//           setPendingTrades(pendingTradesData)

//           // Update stats
//           setUserStats((prev) => ({
//             ...prev,
//             pendingRequests: pendingTradesData.length || 0,
//             completedTrades: action === "accept" ? prev.completedTrades + 1 : prev.completedTrades,
//           }))
//         } catch (altError) {
//           console.error("Error fetching from alternative trades endpoint:", altError)
//           // If both fail, just remove the trade that was actioned from the current list
//           setPendingTrades((prevTrades) => prevTrades.filter((trade) => (trade.id || trade._id) !== tradeId))
//         }
//       }
//     } catch (error) {
//       console.error(`Error ${action}ing trade request:`, error)
//       setNotification({
//         message: `Failed to ${action} trade request. Please try again.`,
//         type: "error",
//       })

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     try {
//       const token = localStorage.getItem("token")
//       if (!token) {
//         setNotification({
//           message: "Unauthorized! Redirecting to login.",
//           type: "error",
//         })
//         setTimeout(() => {
//           navigate("/login")
//         }, 2000)
//         return
//       }

//       const response = await axios.put(
//         "http://localhost:8080/api/update-profile",
//         {
//           username,
//           email,
//           currentPassword,
//           newPassword,
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )

//       if (response.status === 200) {
//         setNotification({
//           message: "Profile updated successfully!",
//           type: "success",
//         })

//         // Clear form fields
//         setCurrentPassword("")
//         setNewPassword("")
//       } else {
//         setNotification({
//           message: response.data.message || "Update failed.",
//           type: "error",
//         })
//       }

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//     } catch (error) {
//       console.error("Error updating profile:", error)
//       setNotification({
//         message: "Failed to update profile.",
//         type: "error",
//       })

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//     }
//   }

//   const handleUpdateField = async (field, value) => {
//     if (!value) {
//       setNotification({
//         message: `${field} cannot be empty.`,
//         type: "error",
//       })

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//       return
//     }

//     try {
//       const token = localStorage.getItem("token")
//       if (!token) {
//         setNotification({
//           message: "Unauthorized! Redirecting to login.",
//           type: "error",
//         })
//         setTimeout(() => {
//           navigate("/login")
//         }, 2000)
//         return
//       }

//       const response = await axios.put(
//         "http://localhost:8080/api/update-profile",
//         { field, value },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )

//       if (response.status === 200) {
//         setNotification({
//           message: `${field} updated successfully!`,
//           type: "success",
//         })
//       } else {
//         setNotification({
//           message: response.data.message || "Update failed.",
//           type: "error",
//         })
//       }

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//     } catch (error) {
//       console.error(`Error updating ${field}:`, error)
//       setNotification({
//         message: `Failed to update ${field}.`,
//         type: "error",
//       })

//       setTimeout(() => {
//         setNotification(null)
//       }, 3000)
//     }
//   }

//   const getSeasonColor = (season) => {
//     switch (season?.toLowerCase()) {
//       case "spring":
//         return "#a8e6cf"
//       case "summer":
//         return "#ffdfba"
//       case "autumn":
//         return "#ffb7b2"
//       case "winter":
//         return "#b5c9df"
//       default:
//         return "#a0a0a0"
//     }
//   }

//   const getSeasonIcon = (season) => {
//     switch (season?.toLowerCase()) {
//       case "spring":
//         return "🌱"
//       case "summer":
//         return "☀️"
//       case "autumn":
//         return "🍂"
//       case "winter":
//         return "❄️"
//       default:
//         return "🌐"
//     }
//   }

//   if (loading) {
//     return (
//       <div style={profilePageStyle}>
//         <div style={overlayStyle}></div>
//         <TabsComponent />
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             height: "100vh",
//             width: "100%",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               padding: "2rem",
//               borderRadius: "12px",
//               backgroundColor: "rgba(255, 255, 255, 0.1)",
//               backdropFilter: "blur(10px)",
//               boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
//             }}
//           >
//             <div
//               style={{
//                 width: "50px",
//                 height: "50px",
//                 border: "3px solid rgba(255, 255, 255, 0.3)",
//                 borderRadius: "50%",
//                 borderTopColor: "#ffffff",
//                 animation: "spin 1s linear infinite",
//                 marginBottom: "1rem",
//               }}
//             ></div>
//             <h2 style={{ color: "#fff", margin: "0" }}>Loading Profile...</h2>
//             <style>{`
//               @keyframes spin {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(360deg); }
//               }
//             `}</style>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div style={profilePageStyle}>
//       <div style={overlayStyle}></div>
//       <TabsComponent />
//       <div style={{ display: "flex", paddingTop: "64px" }}>
//         <Sidebar onManageProfileClick={() => setShowEditProfile(true)} />
//         <div style={contentStyle}>
//           {!showEditProfile ? (
//             <>
//               {/* Profile Stats Section */}
//               <div
//                 style={{
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "center",
//                   marginBottom: "2rem",
//                   animation: "fadeIn 0.5s ease-out",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     justifyContent: "center",
//                     gap: "1.5rem",
//                     width: "100%",
//                     maxWidth: "1000px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       flex: "1 1 200px",
//                       backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       backdropFilter: "blur(10px)",
//                       borderRadius: "12px",
//                       padding: "1.5rem",
//                       textAlign: "center",
//                       boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                       transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = "translateY(-5px)"
//                       e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)"
//                       e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
//                     }}
//                   >
//                     <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📦</div>
//                     <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Total Products</h3>
//                     <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.totalProducts}</p>
//                   </div>

//                   <div
//                     style={{
//                       flex: "1 1 200px",
//                       backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       backdropFilter: "blur(10px)",
//                       borderRadius: "12px",
//                       padding: "1.5rem",
//                       textAlign: "center",
//                       boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                       transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = "translateY(-5px)"
//                       e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)"
//                       e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
//                     }}
//                   >
//                     <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>⏳</div>
//                     <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Pending Requests</h3>
//                     <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.pendingRequests}</p>
//                   </div>

//                   <div
//                     style={{
//                       flex: "1 1 200px",
//                       backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       backdropFilter: "blur(10px)",
//                       borderRadius: "12px",
//                       padding: "1.5rem",
//                       textAlign: "center",
//                       boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                       transition: "transform 0.3s ease, box-shadow 0.3s ease",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = "translateY(-5px)"
//                       e.currentTarget.style.boxShadow = "0 12px 25px rgba(0, 0, 0, 0.15)"
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)"
//                       e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.1)"
//                     }}
//                   >
//                     <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🤝</div>
//                     <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: "400" }}>Completed Trades</h3>
//                     <p style={{ margin: "0", fontSize: "2rem", fontWeight: "600" }}>{userStats.completedTrades}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Tab Navigation */}
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginBottom: "2rem",
//                   width: "100%",
//                   animation: "fadeIn 0.6s ease-out",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     backgroundColor: "rgba(255, 255, 255, 0.1)",
//                     backdropFilter: "blur(10px)",
//                     borderRadius: "30px",
//                     padding: "0.5rem",
//                     boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
//                     border: "1px solid rgba(255, 255, 255, 0.1)",
//                   }}
//                 >
//                   <button
//                     onClick={() => setActiveTab("products")}
//                     style={{
//                       padding: "0.75rem 1.5rem",
//                       borderRadius: "25px",
//                       border: "none",
//                       backgroundColor: activeTab === "products" ? "rgba(255, 255, 255, 0.2)" : "transparent",
//                       color: "#fff",
//                       fontSize: "1rem",
//                       fontWeight: activeTab === "products" ? "500" : "400",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                   >
//                     Your Products
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("trades")}
//                     style={{
//                       padding: "0.75rem 1.5rem",
//                       borderRadius: "25px",
//                       border: "none",
//                       backgroundColor: activeTab === "trades" ? "rgba(255, 255, 255, 0.2)" : "transparent",
//                       color: "#fff",
//                       fontSize: "1rem",
//                       fontWeight: activeTab === "trades" ? "500" : "400",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                     }}
//                   >
//                     Pending Trades
//                   </button>
//                 </div>
//               </div>

//               {/* Your Products Tab */}
//               <div
//                 style={{
//                   width: "100%",
//                   maxWidth: "1200px",
//                   animation: activeTab === "products" ? "fadeInUp 0.7s ease-out" : "fadeInUp 0.7s ease-out",
//                   display: activeTab === "products" ? "block" : "none",
//                 }}
//               >
//                 <h2
//                   style={{
//                     fontSize: "2rem",
//                     fontWeight: "300",
//                     marginBottom: "1.5rem",
//                     textAlign: "center",
//                     color: "#fff",
//                   }}
//                 >
//                   Your Products
//                 </h2>

//                 {products.length > 0 ? (
//                   <div style={tableContainerStyle}>
//                     <table style={tableStyle}>
//                       <thead>
//                         <tr>
//                           <th style={tableHeaderStyle}>Image</th>
//                           <th style={tableHeaderStyle}>Product Name</th>
//                           <th style={tableHeaderStyle}>Season</th>
//                           <th style={tableHeaderStyle}>Description</th>
//                           <th style={tableHeaderStyle}>Listed</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {products.map((product) => (
//                           <tr key={product.id} style={tableRowStyle}>
//                             <td>
//                               {product.product_image ? (
//                                 <img
//                                   src={`http://localhost:8080/${product.product_image}`}
//                                   alt={product.product_name}
//                                   style={imageStyle}
//                                 />
//                               ) : (
//                                 <div
//                                   style={{
//                                     width: "75px",
//                                     height: "75px",
//                                     display: "flex",
//                                     alignItems: "center",
//                                     justifyContent: "center",
//                                     backgroundColor: "rgba(0, 0, 0, 0.2)",
//                                     borderRadius: "10px",
//                                     fontSize: "2rem",
//                                   }}
//                                 >
//                                   {getSeasonIcon(product.suitable_season)}
//                                 </div>
//                               )}
//                             </td>
//                             <td style={{ fontWeight: "500" }}>{product.product_name}</td>
//                             <td>
//                               <span
//                                 style={{
//                                   display: "inline-block",
//                                   padding: "5px 10px",
//                                   backgroundColor: getSeasonColor(product.suitable_season),
//                                   color: "#fff",
//                                   borderRadius: "20px",
//                                   fontSize: "0.85rem",
//                                 }}
//                               >
//                                 {product.suitable_season}
//                               </span>
//                             </td>
//                             <td
//                               style={{
//                                 maxWidth: "300px",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis",
//                                 whiteSpace: "nowrap",
//                               }}
//                             >
//                               {product.product_description}
//                             </td>
//                             <td>{getTimeSinceListed(product.created_at)}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       backdropFilter: "blur(10px)",
//                       borderRadius: "12px",
//                       padding: "3rem 2rem",
//                       textAlign: "center",
//                       boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                       margin: "0 1rem",
//                     }}
//                   >
//                     <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
//                     <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "300", marginBottom: "1rem" }}>
//                       You haven't listed any products yet
//                     </h3>
//                     <p style={{ color: "rgba(255, 255, 255, 0.8)", maxWidth: "500px", margin: "0 auto 1.5rem" }}>
//                       Start listing your seasonal products to trade with others in the community.
//                     </p>
//                     <button
//                       onClick={() => navigate("/dashboard")}
//                       style={{
//                         padding: "0.8rem 1.5rem",
//                         backgroundColor: "rgba(255, 255, 255, 0.2)",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "30px",
//                         fontSize: "1rem",
//                         cursor: "pointer",
//                         transition: "all 0.3s ease",
//                       }}
//                       onMouseEnter={(e) => {
//                         e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"
//                         e.currentTarget.style.transform = "translateY(-2px)"
//                       }}
//                       onMouseLeave={(e) => {
//                         e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
//                         e.currentTarget.style.transform = "translateY(0)"
//                       }}
//                     >
//                       Go to Dashboard
//                     </button>
//                   </div>
//                 )}
//               </div>

//               {/* Pending Trades Tab */}
//               <div
//                 style={{
//                   width: "100%",
//                   maxWidth: "1200px",
//                   animation: "fadeInUp 0.7s ease-out",
//                   display: activeTab === "trades" ? "block" : "none",
//                 }}
//               >
//                 <h2
//                   style={{
//                     fontSize: "2rem",
//                     fontWeight: "300",
//                     marginBottom: "1.5rem",
//                     textAlign: "center",
//                     color: "#fff",
//                   }}
//                 >
//                   Pending Trade Requests
//                 </h2>

//                 {pendingTrades.length > 0 ? (
//                   <div style={tableContainerStyle}>
//                     <table style={tableStyle}>
//                       <thead>
//                         <tr>
//                           <th style={tableHeaderStyle}>Trade ID</th>
//                           <th style={tableHeaderStyle}>Requested Item</th>
//                           <th style={tableHeaderStyle}>Coins Offered</th>
//                           <th style={tableHeaderStyle}>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {pendingTrades.map((trade, index) => (
//                           <tr key={trade.id || trade._id || index} style={tableRowStyle}>
//                             <td style={{ fontWeight: "500" }}>{trade.id || trade._id || "N/A"}</td>
//                             {/* <td>
//                               {trade.requested_item_id || trade.requestedItemId || trade.productName || "Unknown Item"}
//                             </td> */}
//                             <td>
//   {(() => {
//     const product = products.find(p => p.id === trade.requested_item_id || p.id === trade.requestedItemId);
//     return product?.product_image ? (
//       <img
//         src={`http://localhost:8080/${product.product_image}`}
//         alt={product.product_name}
//         style={{
//           width: "60px",
//           height: "60px",
//           borderRadius: "8px",
//           objectFit: "cover",
//         }}
//       />
//     ) : (
//       "Image not found"
//     );
//   })()}
// </td>

//                             <td>
//                               <span
//                                 style={{
//                                   display: "inline-block",
//                                   padding: "5px 15px",
//                                   backgroundColor: "rgba(255, 193, 7, 0.2)",
//                                   color: "#FFC107",
//                                   borderRadius: "20px",
//                                   fontWeight: "bold",
//                                 }}
//                               >
//                                 {trade.coins_offered || trade.coinsOffered || 0} coins
//                               </span>
//                             </td>
//                             <td>
//                               <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
//                                 <button
//                                   onClick={() => handleTradeRequestAction(trade.id || trade._id, "accept")}
//                                   style={{
//                                     padding: "8px 16px",
//                                     backgroundColor: "rgba(76, 175, 80, 0.2)",
//                                     color: "#4CAF50",
//                                     border: "1px solid rgba(76, 175, 80, 0.3)",
//                                     borderRadius: "20px",
//                                     cursor: "pointer",
//                                     fontWeight: "500",
//                                     transition: "all 0.3s ease",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.3)"
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(76, 175, 80, 0.2)"
//                                   }}
//                                 >
//                                   Accept
//                                 </button>
//                                 <button
//                                   onClick={() => handleTradeRequestAction(trade.id || trade._id, "decline")}
//                                   style={{
//                                     padding: "8px 16px",
//                                     backgroundColor: "rgba(244, 67, 54, 0.2)",
//                                     color: "#f44336",
//                                     border: "1px solid rgba(244, 67, 54, 0.3)",
//                                     borderRadius: "20px",
//                                     cursor: "pointer",
//                                     fontWeight: "500",
//                                     transition: "all 0.3s ease",
//                                   }}
//                                   onMouseEnter={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(244, 67, 54, 0.3)"
//                                   }}
//                                   onMouseLeave={(e) => {
//                                     e.currentTarget.style.backgroundColor = "rgba(244, 67, 54, 0.2)"
//                                   }}
//                                 >
//                                   Decline
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 ) : (
//                   <div
//                     style={{
//                       backgroundColor: "rgba(255, 255, 255, 0.1)",
//                       backdropFilter: "blur(10px)",
//                       borderRadius: "12px",
//                       padding: "3rem 2rem",
//                       textAlign: "center",
//                       boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//                       border: "1px solid rgba(255, 255, 255, 0.1)",
//                       margin: "0 1rem",
//                     }}
//                   >
//                     <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
//                     <h3 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "300", marginBottom: "1rem" }}>
//                       No pending trade requests
//                     </h3>
//                     <p style={{ color: "rgba(255, 255, 255, 0.8)", maxWidth: "500px", margin: "0 auto" }}>
//                       When someone wants to trade for one of your products, the request will appear here.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </>
//           ) : (
//             <div
//               style={{
//                 width: "100%",
//                 display: "flex",
//                 justifyContent: "center",
//                 animation: "scaleIn 0.5s ease-out",
//               }}
//             >
//               <div
//                 style={{
//                   width: "100%",
//                   maxWidth: "500px",
//                   backgroundColor: "rgba(255, 255, 255, 0.1)",
//                   backdropFilter: "blur(10px)",
//                   borderRadius: "12px",
//                   padding: "2.5rem",
//                   boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
//                   border: "1px solid rgba(255, 255, 255, 0.1)",
//                 }}
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "2rem",
//                   }}
//                 >
//                   <h2
//                     style={{
//                       fontSize: "1.8rem",
//                       fontWeight: "300",
//                       color: "#fff",
//                       margin: 0,
//                     }}
//                   >
//                     Edit Your Profile
//                   </h2>

//                   <button
//                     onClick={() => setShowEditProfile(false)}
//                     style={{
//                       backgroundColor: "transparent",
//                       border: "1px solid rgba(255, 255, 255, 0.3)",
//                       borderRadius: "30px",
//                       padding: "0.6rem 1.2rem",
//                       color: "#fff",
//                       fontSize: "0.9rem",
//                       cursor: "pointer",
//                       transition: "all 0.3s ease",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "0.5rem",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = "transparent"
//                     }}
//                   >
//                     <svg
//                       width="16"
//                       height="16"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <line x1="19" y1="12" x2="5" y2="12"></line>
//                       <polyline points="12 19 5 12 12 5"></polyline>
//                     </svg>
//                     Back
//                   </button>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                   <div style={{ marginBottom: "1.5rem" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "0.5rem",
//                         color: "rgba(255, 255, 255, 0.8)",
//                         fontSize: "0.9rem",
//                       }}
//                     >
//                       Username
//                     </label>
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "0.75rem",
//                       }}
//                     >
//                       <input
//                         type="text"
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         style={{
//                           flex: 1,
//                           padding: "0.8rem 1rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.05)",
//                           border: "1px solid rgba(255, 255, 255, 0.1)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "1rem",
//                           outline: "none",
//                           transition: "all 0.3s ease",
//                         }}
//                         onFocus={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                         onBlur={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
//                         }}
//                         placeholder="Enter username"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => handleUpdateField("username", username)}
//                         style={{
//                           padding: "0.8rem 1.2rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.1)",
//                           border: "1px solid rgba(255, 255, 255, 0.2)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "0.9rem",
//                           cursor: "pointer",
//                           transition: "all 0.3s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                       >
//                         Save
//                       </button>
//                     </div>
//                   </div>

//                   <div style={{ marginBottom: "1.5rem" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "0.5rem",
//                         color: "rgba(255, 255, 255, 0.8)",
//                         fontSize: "0.9rem",
//                       }}
//                     >
//                       Email
//                     </label>
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "0.75rem",
//                       }}
//                     >
//                       <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         style={{
//                           flex: 1,
//                           padding: "0.8rem 1rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.05)",
//                           border: "1px solid rgba(255, 255, 255, 0.1)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "1rem",
//                           outline: "none",
//                           transition: "all 0.3s ease",
//                         }}
//                         onFocus={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                         onBlur={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
//                         }}
//                         placeholder="Enter email"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => handleUpdateField("email", email)}
//                         style={{
//                           padding: "0.8rem 1.2rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.1)",
//                           border: "1px solid rgba(255, 255, 255, 0.2)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "0.9rem",
//                           cursor: "pointer",
//                           transition: "all 0.3s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                       >
//                         Save
//                       </button>
//                     </div>
//                   </div>

//                   <div style={{ marginBottom: "1.5rem" }}>
//                     <label
//                       style={{
//                         display: "block",
//                         marginBottom: "0.5rem",
//                         color: "rgba(255, 255, 255, 0.8)",
//                         fontSize: "0.9rem",
//                       }}
//                     >
//                       New Password
//                     </label>
//                     <div
//                       style={{
//                         display: "flex",
//                         gap: "0.75rem",
//                       }}
//                     >
//                       <input
//                         type="password"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                         style={{
//                           flex: 1,
//                           padding: "0.8rem 1rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.05)",
//                           border: "1px solid rgba(255, 255, 255, 0.1)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "1rem",
//                           outline: "none",
//                           transition: "all 0.3s ease",
//                         }}
//                         onFocus={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                         onBlur={(e) => {
//                           e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"
//                           e.target.style.backgroundColor = "rgba(255, 255, 255, 0.05)"
//                         }}
//                         placeholder="Enter new password"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => handleUpdateField("password", newPassword)}
//                         style={{
//                           padding: "0.8rem 1.2rem",
//                           backgroundColor: "rgba(255, 255, 255, 0.1)",
//                           border: "1px solid rgba(255, 255, 255, 0.2)",
//                           borderRadius: "8px",
//                           color: "#fff",
//                           fontSize: "0.9rem",
//                           cursor: "pointer",
//                           transition: "all 0.3s ease",
//                         }}
//                         onMouseEnter={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)"
//                         }}
//                         onMouseLeave={(e) => {
//                           e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"
//                         }}
//                       >
//                         Save
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Floating Message Button */}
//       <button
//         onClick={() => setShowMessages(true)}
//         style={{
//           position: "fixed",
//           bottom: "20px",
//           right: "20px",
//           backgroundColor: "#4CAF50",
//           color: "white",
//           border: "none",
//           borderRadius: "50%",
//           width: "60px",
//           height: "60px",
//           fontSize: "24px",
//           cursor: "pointer",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
//           zIndex: 100,
//         }}
//       >
//         <MessageCircle size={24} />
//       </button>

//       {/* Messages Modal */}
//       {showMessages && (
//         <div
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             backgroundColor: "rgba(0,0,0,0.8)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 1000,
//           }}
//         >
//           <div
//             style={{
//               width: "80%",
//               height: "80%",
//               borderRadius: "10px",
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <Message userId={userId} onClose={() => setShowMessages(false)} />
//           </div>
//         </div>
//       )}

//       {/* Notification */}
//       {notification && (
//         <div
//           style={{
//             position: "fixed",
//             bottom: "2rem",
//             right: "2rem",
//             backgroundColor: notification.type === "success" ? "rgba(76, 175, 80, 0.9)" : "rgba(244, 67, 54, 0.9)",
//             color: "#fff",
//             padding: "1rem 1.5rem",
//             borderRadius: "8px",
//             boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)",
//             zIndex: 1000,
//             display: "flex",
//             alignItems: "center",
//             gap: "0.75rem",
//             animation: "fadeInUp 0.3s ease-out",
//           }}
//         >
//           {notification.type === "success" ? (
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
//               <polyline points="22 4 12 14.01 9 11.01"></polyline>
//             </svg>
//           ) : (
//             <svg
//               width="20"
//               height="20"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <circle cx="12" cy="12" r="10"></circle>
//               <line x1="12" y1="8" x2="12" y2="12"></line>
//               <line x1="12" y1="16" x2="12.01" y2="16"></line>
//             </svg>
//           )}
//           {notification.message}
//         </div>
//       )}

//       <Footer />
//     </div>
//   )
// }

// // Styles
// const profilePageStyle = {
//   backgroundImage:
//     "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2664&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
//   backgroundSize: "cover",
//   backgroundPosition: "center",
//   backgroundAttachment: "fixed",
//   minHeight: "100vh",
//   display: "flex",
//   flexDirection: "column",
//   position: "relative",
//   zIndex: 1,
// }

// const overlayStyle = {
//   position: "absolute",
//   top: 0,
//   left: 0,
//   width: "100%",
//   height: "100%",
//   backgroundColor: "rgba(0, 0, 0, 0.5)",
//   zIndex: -1,
// }

// const contentStyle = {
//   marginLeft: "270px",
//   flex: 1,
//   padding: "20px",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   color: "#fff",
//   textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
//   fontFamily: "'Poppins', sans-serif",
// }

// // Table container with better spacing
// const tableContainerStyle = {
//   width: "100%",
//   marginTop: "20px",
//   display: "flex",
//   justifyContent: "center",
// }

// // Table styling with better column spacing
// const tableStyle = {
//   width: "85%",
//   borderCollapse: "separate",
//   borderSpacing: "0 12px", // Adds spacing between rows
//   textAlign: "center",
//   backgroundColor: "rgba(255, 255, 255, 0.05)", // Lightened glassmorphism effect
//   backdropFilter: "blur(10px)",
//   borderRadius: "12px",
//   overflow: "hidden",
//   color: "#fff",
//   padding: "15px",
//   boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.25)", // Deeper shadow for depth
// }

// // Header row with modern styling
// const tableHeaderStyle = {
//   background: "rgba(0, 0, 0, 0.3)", // Darker header for contrast
//   color: "#fff",
//   fontSize: "1rem",
//   padding: "15px",
//   textAlign: "center",
//   fontWeight: "400",
// }

// // Table row styling with increased row height
// const tableRowStyle = {
//   height: "80px", // More row height for spacing
//   transition: "all 0.3s ease-in-out",
//   textAlign: "center",
//   backgroundColor: "rgba(255, 255, 255, 0.05)",
//   borderRadius: "8px",
// }

// // Image styling
// const imageStyle = {
//   width: "75px",
//   height: "75px",
//   borderRadius: "10px",
//   objectFit: "cover",
//   transition: "transform 0.3s ease-in-out",
//   boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
//   margin: "5px auto",
// }

// export default Profile
