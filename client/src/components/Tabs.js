import React, { useState, useEffect } from "react";
import { AppBar, Tab, Tabs, Box, IconButton, Typography } from "@mui/material";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import PersonIcon from "@mui/icons-material/Person";
import logo from "../image/logo.png";

function TabsComponent() {
    const navigate = useNavigate();
    const location = useLocation();  
    const [value, setValue] = useState(0);
    const [coinBalance, setCoinBalance] = useState(0); // Placeholder for coin balance

    useEffect(() => {
        if (location.pathname === "/profile") {
            setValue(1);
        } else if (location.pathname === "/") {
            setValue(0);
        }

        // Placeholder logic to set coin balance
        const fetchCoinBalance = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const response = await axios.get('http://localhost:8080/api/user/coins', {
                    headers: {
                        Authorization: `Bearer ${token}` 
                    }
                });
                setCoinBalance(response.data.coins);
            } catch (error) {
                console.error("Error fetching coin balance:", error);
            }
        };

        fetchCoinBalance();
    }, [location.pathname]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <Box sx={{ width: "100%" }}>
            <AppBar position="fixed" sx={{ backgroundColor: "#333" }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                    {/* Leftmost Logo */}
                    <Box sx={{ marginLeft: 2 }}>
                        <img
                            src={logo}  
                            alt="Logo"
                            style={{ height: "40px" }} 
                        />
                    </Box>

                    {/* Tab Section */}
                    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
                        <Tabs
                            value={value}
                            onChange={handleChange}
                            aria-label="navigation tabs"
                            sx={{
                                "& .MuiTab-root": {
                                    color: "#fff",
                                },
                                "& .Mui-selected": {
                                    color: "#ff5722",
                                },
                                "& .MuiTabs-indicator": {
                                    backgroundColor: "#ff5722",
                                },
                            }}
                        >
                            <Tab label="Home" component={Link} to="/dashboard" />
                            {/* <Tab label="Category" component={Link} to="/category" /> */}
                            <Tab label="Profile" component={Link} to="/profile" />
                            <Tab label="Logout" onClick={handleLogout} />
                        </Tabs>
                    </Box>

                    {/* Rightmost Profile Icon and Coin Balance */}
                    <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
                        <Typography sx={{ color: "#fff", marginRight: 2 }}>Coins: {coinBalance}</Typography>
                        <IconButton component={Link} to="/profile" sx={{ color: "#fff" }}>
                            <PersonIcon />
                        </IconButton>
                    </Box>
                </Box>
            </AppBar>
        </Box>
    );
}

export default TabsComponent;
