"use client"

import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import TabsComponent from "./Tabs"
import Footer from "./Footer"

// Configure axios to use the token from localStorage for all requests
const setupAxiosInterceptors = () => {
  // Request interceptor to add the auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error),
  )

  // Response interceptor to handle auth errors
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only redirect on 401 errors from actual API calls (not on login)
      if (error.response && error.response.status === 401 && !error.config.url.includes("/api/login")) {
        console.log("Authentication error detected, redirecting to login")
        localStorage.removeItem("token")
        window.location.href = "/login?expired=true"
      }
      return Promise.reject(error)
    },
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [seasons, setSeasons] = useState([])
  const [productName, setProductName] = useState("")
  const [suitableSeason, setSuitableSeason] = useState("")
  const [productDescription, setProductDescription] = useState("")
  const [productImage, setProductImage] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeIndex, setActiveIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const [scrollY, setScrollY] = useState(0)
  const [activeSection, setActiveSection] = useState("hero")
  const [weatherData, setWeatherData] = useState(null)
  const [currentSeason, setCurrentSeason] = useState("")
  const [productCounts, setProductCounts] = useState({
    spring: 0,
    summer: 0,
    autumn: 0,
    winter: 0,
  })
  const [location, setLocation] = useState(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false)
  const formRef = useRef(null)
  const seasonsRef = useRef(null)
  const textRef = useRef(null)

  // Setup axios interceptors once when component mounts
  useEffect(() => {
    setupAxiosInterceptors()
  }, [])

  // Get current season based on month
  useEffect(() => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) setCurrentSeason("spring")
    else if (month >= 5 && month <= 7) setCurrentSeason("summer")
    else if (month >= 8 && month <= 10) setCurrentSeason("autumn")
    else setCurrentSeason("winter")
  }, [])

  // Get user's location for weather data
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
          // Fallback to a default location (New York)
          setLocation({ lat: 40.7128, lon: -74.006 })
        },
      )
    }
  }, [])

  // Fetch weather data when location is available
  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return

      try {
        // Using OpenWeatherMap API (you would need to replace with your actual API key)
        // In a real app, this should be handled by a server-side API route
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&units=metric&appid=YOUR_API_KEY`,
        )

        // Simulate weather data since we don't have a real API key
        setWeatherData({
          temp: Math.floor(Math.random() * 15) + 15,
          condition: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Clear"][Math.floor(Math.random() * 5)],
          humidity: Math.floor(Math.random() * 30) + 50,
          wind: Math.floor(Math.random() * 10) + 5,
          location: "Your Location", // This would come from the API in a real app
        })
      } catch (error) {
        console.error("Error fetching weather:", error)
        // Fallback weather data
        setWeatherData({
          temp: Math.floor(Math.random() * 15) + 15,
          condition: "Partly Cloudy",
          humidity: Math.floor(Math.random() * 30) + 50,
          wind: Math.floor(Math.random() * 10) + 5,
          location: "Your Location",
        })
      }
    }

    fetchWeather()
  }, [location])

  // Text animation effect
  useEffect(() => {
    if (!textRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-text")
          }
        })
      },
      { threshold: 0.1 },
    )

    observer.observe(textRef.current)

    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current)
      }
    }
  }, [])

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)

      // Determine active section based on scroll position
      const heroSection = document.querySelector(".hero-section")
      const seasonsSection = seasonsRef.current

      if (heroSection && window.scrollY < heroSection.offsetHeight - 100) {
        setActiveSection("hero")
      } else if (seasonsSection && window.scrollY >= seasonsSection.offsetTop - 300) {
        setActiveSection("seasons")
      }

      // Check for elements to animate when they come into view
      const animateOnScroll = (element, animationClass) => {
        if (!element) return

        const rect = element.getBoundingClientRect()
        const isInView =
          rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 && rect.bottom >= 0

        if (isInView) {
          element.classList.add(animationClass)
        }
      }

      // Animate sections when they come into view
      if (seasonsSection) animateOnScroll(seasonsSection, "animate-fade-in")

      // Animate individual elements
      document.querySelectorAll(".animate-on-scroll").forEach((element) => {
        animateOnScroll(element, "animate-fade-in-up")
      })

      document.querySelectorAll(".animate-scale-on-scroll").forEach((element) => {
        animateOnScroll(element, "animate-scale-in")
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch product counts for each season
  const fetchProductCounts = async (token) => {
    try {
      // Make a single API call to get all product counts
      const response = await axios.get("http://localhost:8080/api/products/counts")

      if (response.data && response.data.counts) {
        return response.data.counts
      }

      // If the API doesn't exist or doesn't return the expected format,
      // make individual calls for each season
      const seasons = ["spring", "summer", "autumn", "winter"]
      const counts = {}

      for (const season of seasons) {
        try {
          const seasonResponse = await axios.get(`http://localhost:8080/api/products/${season}`)

          // If we get an array of products, count them
          if (Array.isArray(seasonResponse.data)) {
            counts[season] = seasonResponse.data.length
          } else if (seasonResponse.data && typeof seasonResponse.data.count === "number") {
            counts[season] = seasonResponse.data.count
          } else {
            counts[season] = 0
          }
        } catch (error) {
          console.error(`Error fetching ${season} products:`, error)
          counts[season] = 0
        }
      }

      return counts
    } catch (error) {
      console.error("Error fetching product counts:", error)
      // Return zeros instead of random numbers
      return {
        spring: 0,
        summer: 0,
        autumn: 0,
        winter: 0,
      }
    }
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        if (!token) {
          navigate("/login")
          return
        }

        // Set the token in axios defaults
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        try {
          const response = await axios.get("http://localhost:8080/api/dashboard")
          console.log("Dashboard data:", response.data)

          // Fetch product counts
          const counts = await fetchProductCounts()
          setProductCounts(counts)

          setInitialLoadAttempted(true)
        } catch (error) {
          console.error("Dashboard API error:", error)

          // If it's an auth error, the interceptor will handle the redirect
          if (error.response && error.response.status !== 401) {
            // For other errors, we still want to show the dashboard
            setInitialLoadAttempted(true)
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()

    // Updated with more elegant, muted season images
    setSeasons([
      {
        id: 1,
        title: "Spring",
        image:
          "https://images.unsplash.com/photo-1491147334573-44cbb4602074?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        color: "#a8e6cf",
        description: "Refresh your style with our spring collection",
        icon: "🌱",
      },
      {
        id: 2,
        title: "Summer",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        color: "#ffdfba",
        description: "Stay cool with our summer essentials",
        icon: "☀️",
      },
      {
        id: 3,
        title: "Autumn",
        image:
          "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        color: "#ffb7b2",
        description: "Embrace the change with autumn favorites",
        icon: "🍂",
      },
      {
        id: 4,
        title: "Winter",
        image:
          "https://images.unsplash.com/photo-1483664852095-d6cc6870702d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
        color: "#b5c9df",
        description: "Stay warm with our winter collection",
        icon: "❄️",
      },
    ])
  }, [navigate])

  const handleSeasonClick = (category) => {
    navigate(`/products/${category}`)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    setProductImage(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const formData = new FormData()
    formData.append("productName", productName)
    formData.append("suitableSeason", suitableSeason)
    formData.append("productDescription", productDescription)
    if (productImage) {
      formData.append("productImage", productImage)
    }

    try {
      const response = await axios.post("http://localhost:8080/api/submit-product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      alert(response.data.message)

      setProductName("")
      setSuitableSeason("")
      setProductDescription("")
      setProductImage(null)
      setShowForm(false)

      // Refresh product counts after submission
      const counts = await fetchProductCounts()
      setProductCounts(counts)
    } catch (error) {
      console.error("Error submitting product:", error)
      if (error.response && error.response.status === 401) {
        // The interceptor will handle the redirect
      } else {
        alert("There was an error submitting your product.")
      }
    }
  }

  const toggleForm = () => {
    setShowForm(!showForm)
    // Scroll to form when opened
    if (!showForm) {
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: "smooth" })
        }
      }, 100)
    }
  }

  const scrollToSection = (sectionRef) => {
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Get season color based on current season
  const getSeasonColor = () => {
    switch (currentSeason) {
      case "spring":
        return "#a8e6cf"
      case "summer":
        return "#ffdfba"
      case "autumn":
        return "#ffb7b2"
      case "winter":
        return "#b5c9df"
      default:
        return "#a8e6cf"
    }
  }

  // Get season icon based on current season
  const getSeasonIcon = () => {
    switch (currentSeason) {
      case "spring":
        return "🌱"
      case "summer":
        return "☀️"
      case "autumn":
        return "🍂"
      case "winter":
        return "❄️"
      default:
        return "🌱"
    }
  }

  // Session expired notification
  if (sessionExpired) {
    return (
      <div
        style={{
          paddingTop: "64px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Session Expired</h2>
          <p style={{ marginBottom: "1.5rem", color: "#666" }}>Your session has expired. Redirecting you to login...</p>
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Loading skeleton component
  if (loading) {
    return (
      <div style={{ paddingTop: "64px", minHeight: "100vh" }}>
        <TabsComponent />
        <div
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                margin: "0 auto 20px",
                border: `3px solid ${getSeasonColor()}`,
                borderRadius: "50%",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <h2 style={{ color: "#fff", fontWeight: "300" }}>Loading your dashboard...</h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>Preparing your {currentSeason} experience</p>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        color: "#333",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <TabsComponent />

      {/* Hero Section with Parallax Effect */}
      <div
        className="hero-section animate-fade-in"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1682687982501-1e58ab814714?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          transform: `translateY(${scrollY * 0.4}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            maxWidth: "800px",
            padding: "0 2rem",
          }}
        >
          <h1
            ref={textRef}
            className="text-reveal"
            style={{
              fontSize: "4rem",
              fontWeight: "200",
              color: "white",
              letterSpacing: "2px",
              marginBottom: "1.5rem",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            We sell connection, with Product
          </h1>

          <p
            className="animate-fade-in-up delay-400"
            style={{
              fontSize: "1.4rem",
              color: "white",
              marginBottom: "3rem",
              fontWeight: "300",
              letterSpacing: "0.5px",
            }}
          >
            Let's promote "RE-USE" and Save Earth
          </p>

          {/* Weather Widget with Real Location */}
          {weatherData && (
            <div
              className="animate-scale-in delay-600"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "15px 25px",
                marginBottom: "2rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "white",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <div style={{ fontSize: "2.5rem" }}>
                  {weatherData.condition?.toLowerCase().includes("rain")
                    ? "🌧️"
                    : weatherData.condition?.toLowerCase().includes("cloud")
                      ? "☁️"
                      : weatherData.condition?.toLowerCase().includes("clear") ||
                          weatherData.condition?.toLowerCase().includes("sunny")
                        ? "☀️"
                        : "🌤️"}
                </div>
                <div>
                  <div style={{ fontSize: "1.8rem", fontWeight: "300" }}>{weatherData.temp}°C</div>
                  <div style={{ fontSize: "0.9rem", opacity: 0.8 }}>{weatherData.condition}</div>
                </div>
              </div>
              <div
                style={{ width: "1px", height: "40px", backgroundColor: "rgba(255, 255, 255, 0.2)", margin: "0 20px" }}
              ></div>
              <div>
                <div style={{ fontSize: "0.9rem", opacity: 0.8, marginBottom: "5px" }}>{weatherData.location}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
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
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                  </svg>
                  <span>Humidity: {weatherData.humidity}%</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2"></path>
                  </svg>
                  <span>Wind: {weatherData.wind} km/h</span>
                </div>
              </div>
            </div>
          )}

          <button
            className="animate-fade-in-up delay-800 hover-scale"
            onClick={toggleForm}
            style={{
              padding: "14px 32px",
              backgroundColor: "transparent",
              color: "white",
              border: "1px solid white",
              borderRadius: "30px",
              cursor: "pointer",
              fontSize: "1.1rem",
              transition: "all 0.4s ease",
              letterSpacing: "1px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {showForm ? "Close Form" : "Submit My Product"}
          </button>
        </div>

        {/* Quick Navigation */}
        <div
          className="animate-fade-in-up delay-1000"
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            display: "flex",
            gap: "15px",
          }}
        >
          <button
            className="hover-scale"
            onClick={() => scrollToSection(seasonsRef)}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
              boxShadow: activeSection === "seasons" ? "0 0 15px rgba(255, 255, 255, 0.5)" : "none",
              transition: "all 0.3s ease",
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
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </button>
        </div>

        {/* Scroll indicator */}
        <div
          className="animate-fade-in delay-1200"
          style={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            animation: "bounce 2s infinite",
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5"></path>
            <path d="M7 7l5 5 5-5"></path>
          </svg>
        </div>

        {/* Add CSS animations */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
              }
              @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              @keyframes scaleIn {
                  from { opacity: 0; transform: scale(0.9); }
                  to { opacity: 1; transform: scale(1); }
              }
              @keyframes bounce {
                  0%, 20%, 50%, 80%, 100% { transform: translateY(0) translateX(-50%); }
                  40% { transform: translateY(-10px) translateX(-50%); }
                  60% { transform: translateY(-5px) translateX(-50%); }
              }
              @keyframes slideIn {
                  from { transform: translateX(-100%); opacity: 0; }
                  to { transform: translateX(0); opacity: 1; }
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
              @keyframes shimmer {
                  0% { background-position: -1000px 0; }
                  100% { background-position: 1000px 0; }
              }
              @keyframes rotate {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
              }
              @keyframes textReveal {
                  0% { opacity: 0; transform: translateY(20px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
              
              .text-reveal {
                opacity: 0;
                animation: textReveal 1.2s ease-out forwards 0.3s;
              }
              
              .animate-fade-in {
                  animation: fadeIn 0.8s ease-out forwards;
              }
              .animate-fade-in-up {
                  animation: fadeInUp 0.8s ease-out forwards;
              }
              .animate-scale-in {
                  animation: scaleIn 0.5s ease-out forwards;
              }
              .delay-200 {
                  animation-delay: 0.2s;
              }
              .delay-400 {
                  animation-delay: 0.4s;
              }
              .delay-600 {
                  animation-delay: 0.6s;
              }
              .delay-800 {
                  animation-delay: 0.8s;
              }
              .delay-1000 {
                  animation-delay: 1s;
              }
              .delay-1200 {
                  animation-delay: 1.2s;
              }
              .hover-scale:hover {
                  transform: scale(1.05) translateY(-3px);
                  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
              }
              .hover-scale:active {
                  transform: scale(0.95);
              }
              .animate-on-scroll {
                  opacity: 0;
                  transform: translateY(20px);
                  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
              }
              .animate-scale-on-scroll {
                  opacity: 0;
                  transform: scale(0.9);
                  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
              }
              .animate-on-scroll.animate-fade-in-up,
              .animate-scale-on-scroll.animate-scale-in {
                  opacity: 1;
                  transform: translateY(0) scale(1);
              }
            `,
          }}
        />
      </div>

      {/* Product Submission Form with Animation */}
      {showForm && (
        <div
          id="product-form"
          ref={formRef}
          className="animate-scale-in"
          style={{
            padding: "5rem 0",
            backgroundColor: "#f8f9fa",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            className="animate-fade-in-up"
            style={{
              maxWidth: "800px",
              width: "100%",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              borderRadius: "12px",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
              padding: "3rem",
              margin: "0 1.5rem",
              backdropFilter: "blur(10px)",
            }}
          >
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "300",
                marginBottom: "2rem",
                color: "#333",
                textAlign: "center",
                letterSpacing: "1px",
              }}
            >
              Post Your Product
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1.8rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#555",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  }}
                  placeholder="Enter product name"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4a90e2"
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 144, 226, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.8rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#555",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Suitable Season
                </label>
                <select
                  value={suitableSeason}
                  onChange={(e) => setSuitableSeason(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "1rem",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    appearance: "none",
                    backgroundImage:
                      'url(\'data:image/svg+xml;utf8,<svg fill="%23555" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>\')',
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center",
                    transition: "all 0.3s ease",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4a90e2"
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 144, 226, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0"
                    e.target.style.boxShadow = "none"
                  }}
                >
                  <option value="">Select a season</option>
                  <option value="spring">Spring</option>
                  <option value="summer">Summer</option>
                  <option value="autumn">Autumn</option>
                  <option value="winter">Winter</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.8rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#555",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Description
                </label>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "0.9rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "1rem",
                    minHeight: "120px",
                    resize: "vertical",
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.3s ease",
                  }}
                  placeholder="Describe your product"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4a90e2"
                    e.target.style.boxShadow = "0 0 0 3px rgba(74, 144, 226, 0.1)"
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0"
                    e.target.style.boxShadow = "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "2.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    color: "#555",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                  }}
                >
                  Upload Image
                </label>
                <div
                  style={{
                    border: "2px dashed #e0e0e0",
                    borderRadius: "8px",
                    padding: "2rem",
                    textAlign: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.5)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#4a90e2"
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.8)"
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#e0e0e0"
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)"
                  }}
                >
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    required
                    style={{
                      display: "none",
                    }}
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    style={{
                      cursor: "pointer",
                      display: "block",
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ margin: "0 auto 1rem" }}
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p style={{ margin: 0, color: "#555" }}>
                      {productImage ? productImage.name : "Click to upload product image"}
                    </p>
                  </label>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="hover-scale"
                  style={{
                    padding: "14px 32px",
                    backgroundColor: "#4a90e2",
                    color: "white",
                    border: "none",
                    borderRadius: "30px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: "500",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 6px rgba(74, 144, 226, 0.2)",
                  }}
                >
                  Submit Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seasons Category Section with Hover Effects */}
      <div
        ref={seasonsRef}
        className="animate-on-scroll seasons-section"
        style={{
          padding: "6rem 2rem",
          backgroundColor: "#fff",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop&ixlib=rb-4.0.3')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="animate-on-scroll"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <h2
            className="animate-on-scroll"
            style={{
              fontSize: "2.5rem",
              fontWeight: "300",
              marginBottom: "1rem",
              color: "#333",
              letterSpacing: "1px",
            }}
          >
            Explore Exclusive Products
          </h2>
          <p
            className="animate-on-scroll"
            style={{
              fontSize: "1.1rem",
              color: "#666",
              maxWidth: "600px",
              margin: "0 auto 4rem",
              lineHeight: "1.6",
            }}
          >
            Sustainable practices can significantly reduce our carbon footprint.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gridTemplateRows: "repeat(2, auto)",
              gap: "2.5rem",
              justifyContent: "center",
            }}
          >
            {seasons.map((season, index) => (
              <div
                key={season.id}
                className="animate-scale-on-scroll"
                onClick={() => handleSeasonClick(season.title.toLowerCase())}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  cursor: "pointer",
                  transition: "all 0.4s ease",
                  position: "relative",
                  transform: activeIndex === index ? "translateY(-10px)" : "translateY(0)",
                  boxShadow:
                    activeIndex === index ? "0 20px 40px rgba(0, 0, 0, 0.15)" : "0 10px 30px rgba(0, 0, 0, 0.08)",
                }}
                class="season-card"
              >
                <div
                  style={{
                    height: "220px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: activeIndex === index ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0)",
                      transition: "all 0.4s ease",
                      zIndex: 1,
                    }}
                  ></div>
                  <img
                    src={season.image || "/placeholder.svg"}
                    alt={season.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.8s ease",
                      transform: activeIndex === index ? "scale(1.1)" : "scale(1)",
                    }}
                  />

                  {/* Product count badge with accurate counts */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#333",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                      fontWeight: "500",
                      zIndex: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                    {productCounts[season.title.toLowerCase()]} Products
                  </div>
                </div>

                <div
                  style={{
                    padding: "1.5rem",
                    position: "relative",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "4px",
                      backgroundColor: season.color,
                      marginBottom: "1rem",
                      transition: "width 0.3s ease",
                      width: activeIndex === index ? "80px" : "50px",
                    }}
                  ></div>

                  <h3
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "1.4rem",
                      fontWeight: "500",
                      color: "#333",
                      textAlign: "left",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{season.icon}</span>
                    {season.title}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#666",
                      fontSize: "0.9rem",
                      textAlign: "left",
                      transition: "all 0.3s ease",
                      opacity: activeIndex === index ? 1 : 0.7,
                    }}
                  >
                    {season.description}
                  </p>

                  <div
                    style={{
                      position: "absolute",
                      right: "1.5rem",
                      bottom: "1.5rem",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: activeIndex === index ? season.color : "#f5f5f5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={activeIndex === index ? "white" : "#888"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard

