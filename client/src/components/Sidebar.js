// // import React, { useEffect, useState } from "react";
// // import axios from "axios";

// // const Sidebar = ({ onManageProfileClick }) => {
// //     const [user, setUser] = useState({ username: "", memberSince: "" });

// //     useEffect(() => {
// //         const fetchUserProfile = async () => {
// //             try {
// //                 const token = localStorage.getItem("token");

// //                 if (!token) return;

// //                 const response = await axios.get("http://localhost:8080/api/profile", {
// //                     headers: { Authorization: `Bearer ${token}` },
// //                 });

// //                 setUser({
// //                     username: response.data.username || "User",
// //                     memberSince: response.data.created_at 
// //                         ? new Date(response.data.created_at).toLocaleDateString() 
// //                         : "Unknown",
// //                 });
// //             } catch (error) {
// //                 console.error("Error fetching user profile:", error);
// //             }
// //         };

// //         fetchUserProfile();
// //     }, []);

// //     return (
// //         <div style={sidebarStyle}>
// //             {/* <div style={profilePictureStyle}></div> */}

// //             <h2>Hello, {user.username}!</h2>

// //             <button style={buttonStyle} onClick={onManageProfileClick}>
// //                 Manage Your Profile
// //             </button>

// //             <div style={{ width: "100%", marginTop: "20px", textAlign: "left" }}>
// //                 <p><strong>📛 NAME:</strong> {user.username}</p>
                
// //                 <p><strong>📅 MEMBER SINCE:</strong> {user.memberSince}</p>
// //             </div>
// //         </div>
// //     );
// // };

// // // // Styles
// // // const sidebarStyle = {
// // //     width: "250px",
// // //     height: "100vh",
// // //     backgroundColor: "#f4f4f4",
// // //     padding: "20px",
// // //     position: "fixed",
// // //     left: 0,
// // //     top: "64px",
// // //     display: "flex",
// // //     flexDirection: "column",
// // //     alignItems: "center",
// // //     boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
// // // };

// // // // const profilePictureStyle = {
// // // //     width: "80px",
// // // //     height: "80px",
// // // //     backgroundColor: "#ccc",
// // // //     borderRadius: "50%",
// // // //     marginBottom: "10px",
// // // // };

// // // const buttonStyle = {
// // //     backgroundColor: "#ff5722",
// // //     color: "#fff",
// // //     padding: "10px 15px",
// // //     border: "none",
// // //     borderRadius: "5px",
// // //     cursor: "pointer",
// // //     marginBottom: "15px",
// // // };

// // // const sidebarStyle = {
// // //     width: "270px",
// // //     height: "100vh",
// // //     backgroundColor: "#ffffff", // Clean white background
// // //     padding: "20px",
// // //     position: "fixed",
// // //     left: 0,
// // //     top: "64px",
// // //     display: "flex",
// // //     flexDirection: "column",
// // //     alignItems: "center",
// // //     boxShadow: "4px 0 8px rgba(0, 0, 0, 0.1)", // Slightly stronger shadow for depth
// // //     borderRadius: "0px 20px 20px 0px", // Rounded right edges for smoothness
// // //     borderRight: "3px solid #ddd", // Soft border to separate from main content
// // // };

// // // // Profile button
// // // const buttonStyle = {
// // //     backgroundColor: "#ff5722",
// // //     color: "#fff",
// // //     padding: "12px 20px",
// // //     border: "none",
// // //     borderRadius: "25px", // Rounded button for modern UI
// // //     cursor: "pointer",
// // //     marginBottom: "20px",
// // //     transition: "background 0.3s ease",
// // //     fontWeight: "bold",
// // //     fontSize: "14px",
// // //     boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
// // // };

// // // // Hover effect for button
// // // buttonStyle[":hover"] = {
// // //     backgroundColor: "#e64a19",
// // // };

// // // // User info container
// // // const userInfoStyle = {
// // //     width: "100%",
// // //     marginTop: "20px",
// // //     textAlign: "left",
// // //     backgroundColor: "#f9f9f9",
// // //     padding: "15px",
// // //     borderRadius: "10px",
// // //     boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
// // //     fontSize: "14px",
// // // };

// // // // Name and Member Since styling
// // // const textStyle = {
// // //     color: "#333",
// // //     fontWeight: "bold",
// // //     marginBottom: "8px",
// // // };

// // const sidebarStyle = {
// //     width: "260px",
// //     height: "100vh",
// //     backgroundColor: "rgba(255, 255, 255, 0.2)", // Light glass effect
// //     // backdropFilter: "blur(10px)", // Smooth frosted glass effect
// //     padding: "25px",
// //     position: "fixed",
// //     left: 0,
// //     top: "64px",
// //     display: "flex",
// //     flexDirection: "column",
// //     alignItems: "center",
// //     boxShadow: "2px 0 10px rgba(0, 0, 0, 0.5)", // Adds depth
// //     borderRadius: "15px 0 0 15px", // Rounded edges on left side
// //     textAlign: "center",
// //     color: "#fff",
// //     textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
// //     fontFamily: "sans-serif",
// // };

// // // Manage Profile Button Styling
// // const buttonStyle = {
// //     backgroundColor: "#ff5722",
// //     color: "#fff",
// //     padding: "12px 20px",
// //     border: "none",
// //     borderRadius: "10px",
// //     cursor: "pointer",
// //     fontSize: "16px",
// //     fontWeight: "bold",
// //     transition: "all 0.3s ease",
// //     marginTop: "10px",
// //     width: "80%",
// // };

// // // Button hover effect
// // const buttonHoverStyle = {
// //     backgroundColor: "#e64a19",
// // };

// // // User Info Container Styling
// // const userInfoStyle = {
// //     width: "100%",
// //     marginTop: "20px",
// //     textAlign: "left",
// //     padding: "10px",
// //     backgroundColor: "rgba(255, 255, 255, 0.2)", // Subtle background
// //     borderRadius: "10px",
// //     padding: "15px",
// // };

// // // User Name & Member Since Icons
// // const iconStyle = {
// //     marginRight: "10px",
// //     fontSize: "18px",
// // };


// // export default Sidebar;


// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"

// const Sidebar = ({ onManageProfileClick }) => {
//   const [user, setUser] = useState({ username: "", memberSince: "", email: "", coins: 0 })
//   const [loading, setLoading] = useState(true)
//   const [activeLink, setActiveLink] = useState("profile")

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem("token")

//         if (!token) {
//           setLoading(false)
//           return
//         }

//         const response = await axios.get("http://localhost:8080/api/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         // Get coin balance
//         const coinResponse = await axios.get("http://localhost:8080/api/user/coins", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         setUser({
//           username: response.data.username || "User",
//           email: response.data.email || "user@example.com",
//           memberSince: response.data.created_at
//             ? new Date(response.data.created_at).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })
//             : "Unknown",
//           coins: coinResponse.data?.coins || 0,
//         })
//         setLoading(false)
//       } catch (error) {
//         console.error("Error fetching user profile:", error)
//         setLoading(false)
//       }
//     }

//     fetchUserProfile()
//   }, [])

//   // Animation keyframes
//   const keyframes = `
//         @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(10px); }
//             to { opacity: 1; transform: translateY(0); }
//         }
        
//         @keyframes shimmer {
//             0% { background-position: -200px 0; }
//             100% { background-position: 200px 0; }
//         }
        
//         @keyframes pulse {
//             0% { transform: scale(1); }
//             50% { transform: scale(1.05); }
//             100% { transform: scale(1); }
//         }
//     `

//   if (loading) {
//     return (
//       <div style={sidebarStyle}>
//         <style dangerouslySetInnerHTML={{ __html: keyframes }} />
//         <div
//           style={{
//             width: "100px",
//             height: "100px",
//             borderRadius: "50%",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             margin: "20px 0",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "70%",
//             height: "24px",
//             borderRadius: "4px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             marginBottom: "20px",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "80%",
//             height: "40px",
//             borderRadius: "20px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             marginBottom: "30px",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "100%",
//             height: "120px",
//             borderRadius: "8px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//       </div>
//     )
//   }

//   return (
//     <div style={sidebarStyle}>
//       <style dangerouslySetInnerHTML={{ __html: keyframes }} />

//       {/* User Avatar */}
//       <div
//         style={{
//           width: "100px",
//           height: "100px",
//           borderRadius: "50%",
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "2.5rem",
//           margin: "10px 0 20px",
//           boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//           border: "1px solid rgba(255, 255, 255, 0.2)",
//           animation: "fadeIn 0.5s ease-out",
//         }}
//       >
//         {user.username.charAt(0).toUpperCase()}
//       </div>

//       {/* Username */}
//       <h2
//         style={{
//           margin: "0 0 5px 0",
//           fontSize: "1.5rem",
//           fontWeight: "400",
//           animation: "fadeIn 0.6s ease-out",
//         }}
//       >
//         Hello, {user.username}!
//       </h2>

//       {/* Coin Balance */}
//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "8px",
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           padding: "6px 15px",
//           borderRadius: "20px",
//           marginBottom: "25px",
//           animation: "fadeIn 0.7s ease-out",
//         }}
//       >
//         <svg
//           width="18"
//           height="18"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="#FFC107"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <circle cx="12" cy="12" r="10"></circle>
//           <circle cx="12" cy="12" r="3"></circle>
//         </svg>
//         <span style={{ fontWeight: "500" }}>{user.coins} coins</span>
//       </div>

//       {/* Manage Profile Button */}
//       <button
//         style={buttonStyle}
//         onClick={onManageProfileClick}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.backgroundColor = "#e64a19"
//           e.currentTarget.style.transform = "translateY(-3px)"
//           e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.2)"
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.backgroundColor = "#ff5722"
//           e.currentTarget.style.transform = "translateY(0)"
//           e.currentTarget.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.15)"
//         }}
//       >
//         <svg
//           width="18"
//           height="18"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           style={{ marginRight: "8px" }}
//         >
//           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//         </svg>
//         Manage Your Profile
//       </button>

//       {/* Navigation Links */}
//       <div
//         style={{
//           width: "100%",
//           marginTop: "30px",
//           animation: "fadeIn 0.8s ease-out",
//         }}
//       >
//         <a
//           href="#"
//           style={{
//             ...navLinkStyle,
//             backgroundColor: activeLink === "profile" ? "rgba(255, 255, 255, 0.15)" : "transparent",
//           }}
//           onClick={(e) => {
//             e.preventDefault()
//             setActiveLink("profile")
//           }}
//         >
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px" }}
//           >
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//             <circle cx="12" cy="7" r="4"></circle>
//           </svg>
//           Profile
//         </a>

//         <a
//           href="/dashboard"
//           style={{
//             ...navLinkStyle,
//             backgroundColor: activeLink === "dashboard" ? "rgba(255, 255, 255, 0.15)" : "transparent",
//           }}
//           onClick={(e) => {
//             setActiveLink("dashboard")
//           }}
//         >
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px" }}
//           >
//             <rect x="3" y="3" width="7" height="7"></rect>
//             <rect x="14" y="3" width="7" height="7"></rect>
//             <rect x="14" y="14" width="7" height="7"></rect>
//             <rect x="3" y="14" width="7" height="7"></rect>
//           </svg>
//           Dashboard
//         </a>
//       </div>

//       {/* User Info */}
//       <div
//         style={{
//           width: "100%",
//           marginTop: "auto",
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           borderRadius: "10px",
//           padding: "15px",
//           animation: "fadeIn 0.9s ease-out",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             marginBottom: "12px",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//             <circle cx="12" cy="7" r="4"></circle>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Username</div>
//             <div style={{ fontWeight: "500" }}>{user.username}</div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             marginBottom: "12px",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//             <polyline points="22,6 12,13 2,6"></polyline>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Email</div>
//             <div style={{ fontWeight: "500" }}>{user.email}</div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//             <line x1="16" y1="2" x2="16" y2="6"></line>
//             <line x1="8" y1="2" x2="8" y2="6"></line>
//             <line x1="3" y1="10" x2="21" y2="10"></line>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Member Since</div>
//             <div style={{ fontWeight: "500" }}>{user.memberSince}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Styles
// const sidebarStyle = {
//   width: "260px",
//   height: "100vh",
//   backgroundColor: "rgba(0, 0, 0, 0.4)",
//   backdropFilter: "blur(10px)",
//   padding: "25px",
//   position: "fixed",
//   left: 0,
//   top: "64px",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   boxShadow: "2px 0 15px rgba(0, 0, 0, 0.3)",
//   borderRight: "1px solid rgba(255, 255, 255, 0.1)",
//   color: "#fff",
//   textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
//   fontFamily: "'Poppins', sans-serif",
//   overflowY: "auto",
// }

// const buttonStyle = {
//   backgroundColor: "#ff5722",
//   color: "#fff",
//   padding: "12px 20px",
//   border: "none",
//   borderRadius: "30px",
//   cursor: "pointer",
//   fontSize: "0.9rem",
//   fontWeight: "500",
//   transition: "all 0.3s ease",
//   width: "100%",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   boxShadow: "0 5px 10px rgba(0, 0, 0, 0.15)",
//   animation: "fadeIn 0.7s ease-out",
// }

// const navLinkStyle = {
//   display: "flex",
//   alignItems: "center",
//   width: "100%",
//   padding: "12px 15px",
//   borderRadius: "8px",
//   color: "#fff",
//   textDecoration: "none",
//   marginBottom: "8px",
//   transition: "all 0.2s ease",
//   fontSize: "0.95rem",
// }

// export default Sidebar




"use client"

import React, { useEffect } from "react";
import axios from "axios";
import { useUser } from './UserContext';  // Ensure this path is correct and the context provides user and setUser

const Sidebar = ({ onManageProfileClick }) => {
  const [loading, setLoading] = React.useState(true);
  const [activeLink, setActiveLink] = React.useState("profile");
  const { user, setUser } = useUser(); // Only useUser here to access user and setUser

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.log("No token found");
          setLoading(false);
          return;
        }
  
        const response = await axios.get("http://localhost:8080/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        console.log("User data fetched:", response.data); // Log fetched data
  
        setUser({
          username: response.data.username || "Default User",
          memberSince: response.data.created_at 
                        ? new Date(response.data.created_at).toLocaleDateString() 
                        : "Unknown",
        });
        console.log("User context set with:", user); // Log user context after setting
  
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, [setUser]); // Depend on setUser
  
  // Animation keyframes
  const keyframes = `
      @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
      }
      
      @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
      }
  `


  if (loading) {
    return (
      <div style={sidebarStyle}>
        <style dangerouslySetInnerHTML={{ __html: keyframes }} />
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            margin: "20px 0",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        ></div>
        <div
          style={{
            width: "70%",
            height: "24px",
            borderRadius: "4px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginBottom: "20px",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        ></div>
        <div
          style={{
            width: "80%",
            height: "40px",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            marginBottom: "30px",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        ></div>
        <div
          style={{
            width: "100%",
            height: "120px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
            backgroundSize: "400px 100%",
            animation: "shimmer 1.5s infinite linear",
          }}
        ></div>
      </div>
    )
  }

  return (
    <div style={sidebarStyle}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />

      {/* User Avatar */}
      <div
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2.5rem",
          margin: "10px 0 20px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          animation: "fadeIn 0.5s ease-out",
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>

      {/* Welcome message instead of username */}
      <h2
        style={{
          margin: "0 0 5px 0",
          fontSize: "1.5rem",
          fontWeight: "400",
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        Welcome Back!
      </h2>

      {/* Navigation Links */}
      <div
        style={{
          width: "100%",
          marginTop: "30px",
          animation: "fadeIn 0.8s ease-out",
        }}
      >
        <a
          href="#"
          style={{
            ...navLinkStyle,
            backgroundColor: activeLink === "profile" ? "rgba(255, 255, 255, 0.15)" : "transparent",
          }}
          onClick={(e) => {
            e.preventDefault()
            setActiveLink("profile")
          }}
        >
          {/* <svg
            width="1"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ margin: "0 0 0.5rem 0"}} 
            // style={{ marginRight: "10px" }} 
            
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg> */}
          {/* Dynamic Welcome Message */}
          <div>
            <h2>{user.username}</h2>
            
            <div>
              <p><strong>📛 </strong> {user.username}</p>
              <p><strong>📅 </strong> {user.memberSince}</p>
            </div>
          </div>

        </a>

      {/* Manage Profile Button */}
      <button
        style={buttonStyle}
        onClick={onManageProfileClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e64a19"
          e.currentTarget.style.transform = "translateY(-3px)"
          e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.2)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#ff5722"
          e.currentTarget.style.transform = "translateY(0)"
          e.currentTarget.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.15)"
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: "8px" }}
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Manage Your Profile
      </button>

        <a
          href="/dashboard"
          style={{
            ...navLinkStyle,
            backgroundColor: activeLink === "dashboard" ? "rgba(255, 255, 255, 0.15)" : "transparent",
          }}
          onClick={(e) => {
            setActiveLink("dashboard")
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: "10px" }}
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          Dashboard
        </a>
      </div>

      {/* User Info */}
      <div
        style={{
          width: "100%",
          marginTop: "auto",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "10px",
          padding: "15px",
          animation: "fadeIn 0.9s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
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
            style={{ marginRight: "10px", opacity: 0.8 }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Account</div>
            <div style={{ fontWeight: "500" }}>User Profile</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "12px",
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
            style={{ marginRight: "10px", opacity: 0.8 }}
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Email</div>
            <div style={{ fontWeight: "500" }}>{user.email}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
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
            style={{ marginRight: "10px", opacity: 0.8 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <div>
            <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Member Since</div>
            <div style={{ fontWeight: "500" }}>{user.memberSince}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Styles
const sidebarStyle = {
  width: "260px",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
  padding: "25px",
  position: "fixed",
  left: 0,
  top: "64px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "2px 0 15px rgba(0, 0, 0, 0.3)",
  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#fff",
  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
  fontFamily: "'Poppins', sans-serif",
  overflowY: "auto",
}

const buttonStyle = {
  backgroundColor: "#ff5722",
  color: "#fff",
  padding: "12px 20px",
  border: "none",
  borderRadius: "30px",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: "500",
  transition: "all 0.3s ease",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 5px 10px rgba(0, 0, 0, 0.15)",
  animation: "fadeIn 0.7s ease-out",
}

const navLinkStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "12px 15px",
  borderRadius: "8px",
  color: "#fff",
  textDecoration: "none",
  marginBottom: "8px",
  transition: "all 0.2s ease",
  fontSize: "0.95rem",
}

export default Sidebar






// "use client"

// import { useEffect, useState } from "react"
// import axios from "axios"

// const Sidebar = ({ onManageProfileClick }) => {
//   const [user, setUser] = useState({ username: "", memberSince: "", email: "", coins: 0 })
//   const [loading, setLoading] = useState(true)
//   const [activeLink, setActiveLink] = useState("profile")

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const token = localStorage.getItem("token")

//         if (!token) {
//           setLoading(false)
//           return
//         }

//         const response = await axios.get("http://localhost:8080/api/profile", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         // Get coin balance
//         const coinResponse = await axios.get("http://localhost:8080/api/user/coins", {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         setUser({
//           username: response.data.username || "User",
//           email: response.data.email || "user@example.com",
//           memberSince: response.data.created_at
//             ? new Date(response.data.created_at).toLocaleDateString("en-US", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//               })
//             : "Unknown",
//           coins: coinResponse.data?.coins || 0,
//         })
//         setLoading(false)
//       } catch (error) {
//         console.error("Error fetching user profile:", error)
//         setLoading(false)
//       }
//     }

//     fetchUserProfile()
//   }, [])

//   // Animation keyframes
//   const keyframes = `
//         @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(10px); }
//             to { opacity: 1; transform: translateY(0); }
//         }
        
//         @keyframes shimmer {
//             0% { background-position: -200px 0; }
//             100% { background-position: 200px 0; }
//         }
        
//         @keyframes pulse {
//             0% { transform: scale(1); }
//             50% { transform: scale(1.05); }
//             100% { transform: scale(1); }
//         }
//     `

//   if (loading) {
//     return (
//       <div style={sidebarStyle}>
//         <style dangerouslySetInnerHTML={{ __html: keyframes }} />
//         <div
//           style={{
//             width: "100px",
//             height: "100px",
//             borderRadius: "50%",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             margin: "20px 0",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "70%",
//             height: "24px",
//             borderRadius: "4px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             marginBottom: "20px",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "80%",
//             height: "40px",
//             borderRadius: "20px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             marginBottom: "30px",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//         <div
//           style={{
//             width: "100%",
//             height: "120px",
//             borderRadius: "8px",
//             backgroundColor: "rgba(255, 255, 255, 0.1)",
//             background:
//               "linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%)",
//             backgroundSize: "400px 100%",
//             animation: "shimmer 1.5s infinite linear",
//           }}
//         ></div>
//       </div>
//     )
//   }

//   return (
//     <div style={sidebarStyle}>
//       <style dangerouslySetInnerHTML={{ __html: keyframes }} />

//       {/* User Avatar */}
//       <div
//         style={{
//           width: "100px",
//           height: "100px",
//           borderRadius: "50%",
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           fontSize: "2.5rem",
//           margin: "10px 0 20px",
//           boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
//           border: "1px solid rgba(255, 255, 255, 0.2)",
//           animation: "fadeIn 0.5s ease-out",
//         }}
//       >
//         <svg
//           width="40"
//           height="40"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="white"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         >
//           <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//           <circle cx="12" cy="7" r="4"></circle>
//         </svg>
//       </div>

//       {/* Username */}
//       <h2
//         style={{
//           margin: "0 0 5px 0",
//           fontSize: "1.5rem",
//           fontWeight: "400",
//           animation: "fadeIn 0.6s ease-out",
//         }}
//       >
//         Welcome Back!
//       </h2>

//       {/* Manage Profile Button */}
//       <button
//         style={buttonStyle}
//         onClick={onManageProfileClick}
//         onMouseEnter={(e) => {
//           e.currentTarget.style.backgroundColor = "#e64a19"
//           e.currentTarget.style.transform = "translateY(-3px)"
//           e.currentTarget.style.boxShadow = "0 8px 15px rgba(0, 0, 0, 0.2)"
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.backgroundColor = "#ff5722"
//           e.currentTarget.style.transform = "translateY(0)"
//           e.currentTarget.style.boxShadow = "0 5px 10px rgba(0, 0, 0, 0.15)"
//         }}
//       >
//         <svg
//           width="18"
//           height="18"
//           viewBox="0 0 24 24"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="2"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           style={{ marginRight: "8px" }}
//         >
//           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//         </svg>
//         Manage Your Profile
//       </button>

//       {/* Navigation Links */}
//       <div
//         style={{
//           width: "100%",
//           marginTop: "30px",
//           animation: "fadeIn 0.8s ease-out",
//         }}
//       >
//         <a
//           href="#"
//           style={{
//             ...navLinkStyle,
//             backgroundColor: activeLink === "profile" ? "rgba(255, 255, 255, 0.15)" : "transparent",
//           }}
//           onClick={(e) => {
//             e.preventDefault()
//             setActiveLink("profile")
//           }}
//         >
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px" }}
//           >
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//             <circle cx="12" cy="7" r="4"></circle>
//           </svg>
//           Profile
//         </a>

//         <a
//           href="/dashboard"
//           style={{
//             ...navLinkStyle,
//             backgroundColor: activeLink === "dashboard" ? "rgba(255, 255, 255, 0.15)" : "transparent",
//           }}
//           onClick={(e) => {
//             setActiveLink("dashboard")
//           }}
//         >
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px" }}
//           >
//             <rect x="3" y="3" width="7" height="7"></rect>
//             <rect x="14" y="3" width="7" height="7"></rect>
//             <rect x="14" y="14" width="7" height="7"></rect>
//             <rect x="3" y="14" width="7" height="7"></rect>
//           </svg>
//           Dashboard
//         </a>
//       </div>

//       {/* User Info */}
//       <div
//         style={{
//           width: "100%",
//           marginTop: "auto",
//           backgroundColor: "rgba(255, 255, 255, 0.1)",
//           borderRadius: "10px",
//           padding: "15px",
//           animation: "fadeIn 0.9s ease-out",
//         }}
//       >
//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             marginBottom: "12px",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//             <circle cx="12" cy="7" r="4"></circle>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Account</div>
//             <div style={{ fontWeight: "500" }}>User Profile</div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//             marginBottom: "12px",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
//             <polyline points="22,6 12,13 2,6"></polyline>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Email</div>
//             <div style={{ fontWeight: "500" }}>{user.email}</div>
//           </div>
//         </div>

//         <div
//           style={{
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           <svg
//             width="16"
//             height="16"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             style={{ marginRight: "10px", opacity: 0.8 }}
//           >
//             <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//             <line x1="16" y1="2" x2="16" y2="6"></line>
//             <line x1="8" y1="2" x2="8" y2="6"></line>
//             <line x1="3" y1="10" x2="21" y2="10"></line>
//           </svg>
//           <div>
//             <div style={{ fontSize: "0.8rem", opacity: 0.7 }}>Member Since</div>
//             <div style={{ fontWeight: "500" }}>{user.memberSince}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Styles
// const sidebarStyle = {
//   width: "260px",
//   height: "100vh",
//   backgroundColor: "rgba(0, 0, 0, 0.4)",
//   backdropFilter: "blur(10px)",
//   padding: "25px",
//   position: "fixed",
//   left: 0,
//   top: "64px",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   boxShadow: "2px 0 15px rgba(0, 0, 0, 0.3)",
//   borderRight: "1px solid rgba(255, 255, 255, 0.1)",
//   color: "#fff",
//   textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
//   fontFamily: "'Poppins', sans-serif",
//   overflowY: "auto",
// }

// const buttonStyle = {
//   backgroundColor: "#ff5722",
//   color: "#fff",
//   padding: "12px 20px",
//   border: "none",
//   borderRadius: "30px",
//   cursor: "pointer",
//   fontSize: "0.9rem",
//   fontWeight: "500",
//   transition: "all 0.3s ease",
//   width: "100%",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   boxShadow: "0 5px 10px rgba(0, 0, 0, 0.15)",
//   animation: "fadeIn 0.7s ease-out",
// }

// const navLinkStyle = {
//   display: "flex",
//   alignItems: "center",
//   width: "100%",
//   padding: "12px 15px",
//   borderRadius: "8px",
//   color: "#fff",
//   textDecoration: "none",
//   marginBottom: "8px",
//   transition: "all 0.2s ease",
//   fontSize: "0.95rem",
// }

// export default Sidebar