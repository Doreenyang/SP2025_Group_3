import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import TabsComponent from "./Tabs";

function Dashboard() {
    const navigate = useNavigate();
    const [seasons, setSeasons] = useState([]);
    const [productName, setProductName] = useState("");
    const [suitableSeason, setSuitableSeason] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [productImage, setProductImage] = useState(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    alert("Unauthorized! Redirecting to login.");
                    navigate("/login");
                    return;
                }

                const response = await axios.get("http://localhost:8080/api/dashboard", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log(response.data);
            } catch (error) {
                console.error("Dashboard error:", error);
                alert("Session expired. Please log in again.");
                navigate("/login");
            }
        };

        fetchDashboard();

        setSeasons([
            { id: 1, title: "Spring", image: "https://upload.wikimedia.org/wikipedia/commons/f/fb/XN_Fruehjahrswiese_00.jpg" },
            { id: 2, title: "Summer", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/20190212_SKJ0426-HDR-2.jpg/1280px-20190212_SKJ0426-HDR-2.jpg" },
            { id: 3, title: "Autumn", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Autumn_Lane.jpg/1280px-Autumn_Lane.jpg" },
            { id: 4, title: "Winter", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/CathedralofLearningLawinWinter.jpg/1024px-CathedralofLearningLawinWinter.jpg" },
        ]);
    }, [navigate]);

    const handleSeasonClick = (category) => {
        navigate(`/products/${category}`);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setProductImage(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const formData = new FormData();
        formData.append("productName", productName);
        formData.append("suitableSeason", suitableSeason);
        formData.append("productDescription", productDescription);
        if (productImage) {
            formData.append("productImage", productImage);
        }
      
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "http://localhost:8080/api/submit-product", 
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            
            alert(response.data.message);
    
            
            setProductName('');
            setSuitableSeason('');
            setProductDescription('');
            setProductImage(null);
        } catch (error) {
            console.error("Error submitting product:", error);
            alert("There was an error submitting your product.");
        }
    };
    
    
    return (
        <div style={{ paddingTop: "64px", display: "flex", flexDirection: "row", marginLeft: '15%' }}>
      
            <div style={{ width: "30%", padding: "20px" }}>
                <h2>Sell Your Product Here</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Product Name:</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Suitable Season:</label>
                        <select
                            value={suitableSeason}
                            onChange={(e) => setSuitableSeason(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        >
                            <option value="">Select a season</option>
                            <option value="spring">Spring</option>
                            <option value="summer">Summer</option>
                            <option value="autumn">Autumn</option>
                            <option value="winter">Winter</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Description:</label>
                        <textarea
                            value={productDescription}
                            onChange={(e) => setProductDescription(e.target.value)}
                            required
                            style={{ width: "100%", padding: "8px", height: "100px" }}
                        />
                    </div>
                    <div style={{ marginBottom: "15px" }}>
                        <label>Upload Image:</label>
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            required
                            style={{ width: "100%", padding: "8px" }}
                        />
                    </div>
                    <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px" }}>
                        Submit
                    </button>
                </form>
            </div>

           
            <div style={{ width: "70%", padding: "20px" }}>
                <TabsComponent />
                
            
                <div style={{ marginBottom: "20px", textAlign: "center" }}>
                    <h2>Seasons/Category</h2>
                </div>

             
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {seasons.map((season) => (
                        <div
                            key={season.id}
                            style={{
                                width: "300px",
                                margin: "20px 0",  
                                cursor: "pointer",
                                textAlign: "center",
                            }}
                            onClick={() => handleSeasonClick(season.title.toLowerCase())}
                        >
                            <img
                                src={season.image}
                                alt={season.title}
                                style={{
                                    width: "100%",
                                    height: "150px",
                                    objectFit: "cover",
                                    //borderRadius: "8px",
                                }}
                            />
                            <h3 style={{ marginTop: "10px", color: "#333" }}>{season.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
