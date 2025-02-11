// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import TabsComponent from "./Tabs";

// function ProductPage() {
//     const { season } = useParams(); // Extract the season parameter from the URL
//     const navigate = useNavigate();
//     const [products, setProducts] = useState([]);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const token = localStorage.getItem("token");

//                 if (!token) {
//                     alert("Unauthorized! Redirecting to login.");
//                     navigate("/login");
//                     return;
//                 }

//                 const response = await axios.get(`http://localhost:8080/api/products/${season}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 setProducts(response.data);
//             } catch (error) {
//                 console.error("Error fetching products:", error);
//                 alert("Session expired. Please log in again.");
//                 navigate("/login");
//             }
//         };

//         fetchProducts();
//     }, [season, navigate]);

//     return (
//         <div style={{ paddingTop: "64px", display: "flex", flexDirection: "row", marginLeft: "15%" }}>
//             {/* Sidebar or Navigation */}
//             <div style={{ width: "30%", padding: "20px" }}>
//                 <h2>{season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
//                 <p>Browse products available for {season}.</p>
//             </div>

//             {/* Main Content */}
//             <div style={{ width: "70%", padding: "20px" }}>
//                 <div style={{ marginBottom: "20px", textAlign: "center" }}>
//                     <h2>All {season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
//                 </div>

//                 {/* Product Listing */}
//                 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
//                     {products.length > 0 ? (
//                         products.map((product) => (
//                             <div
//                                 key={product.id}
//                                 style={{
//                                     border: "1px solid #ddd",
//                                     borderRadius: "8px",
//                                     padding: "15px",
//                                     textAlign: "center",
//                                     backgroundColor: "#f9f9f9",
//                                 }}
//                             >
//                                 <img
//                                     src={`http://localhost:8080/${product.product_image}`}
//                                     alt={product.product_name}
//                                     style={{
//                                         width: "100%",
//                                         height: "200px",
//                                         objectFit: "cover",
//                                         borderRadius: "8px",
//                                     }}
//                                 />
//                                 <h3 style={{ marginTop: "10px" }}>{product.product_name}</h3>
//                                 <p><strong>Description:</strong> {product.product_description}</p>
//                             </div>
//                         ))
//                     ) : (
//                         <p>No products found for {season}.</p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ProductPage;




// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import TabsComponent from "./Tabs"; // Import the TabsComponent

// function ProductPage() {
//     const { season } = useParams();
//     const navigate = useNavigate();
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchProducts = async () => {
//             try {
//                 const token = localStorage.getItem("token");
//                 if (!token) {
//                     alert("Unauthorized! Redirecting to login.");
//                     navigate("/login");
//                     return;
//                 }

//                 const response = await axios.get(`http://localhost:8080/api/products/${season}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });

//                 setProducts(response.data);
//             } catch (error) {
//                 console.error("Error fetching products:", error);
//                 alert("Failed to fetch products. Please try again.");
//                 navigate("/login");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchProducts();
//     }, [season, navigate]);

//     if (loading) return <p>Loading...</p>;

//     return (
//         <div>
//             {/* Add the TabsComponent at the top */}
//             <TabsComponent />
            
//             {/* Content of Product Page */}
//             <div style={{ paddingTop: "64px", marginLeft: "15%", display: "flex", flexDirection: "row" }}>
//                 <div style={{ width: "30%", padding: "20px" }}>
//                     <h2>{season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
//                     <p>Browse the best products available for {season}.</p>
//                 </div>
//                 <div style={{ width: "70%", padding: "20px" }}>
//                     <div style={{ marginBottom: "20px", textAlign: "center" }}>
//                         <h2>All {season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
//                     </div>
//                     <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
//                         {products.length > 0 ? (
//                             products.map((product) => (
//                                 <div
//                                     key={product.id}
//                                     style={{
//                                         border: "1px solid #ddd",
//                                         borderRadius: "8px",
//                                         padding: "15px",
//                                         textAlign: "center",
//                                         backgroundColor: "#f9f9f9",
//                                     }}
//                                 >
//                                     {product.product_image && (
//                                         <img
//                                             src={`http://localhost:8080/${product.product_image}`}
//                                             alt={product.product_name}
//                                             style={{
//                                                 width: "100%",
//                                                 height: "150px",
//                                                 objectFit: "cover",
//                                                 borderRadius: "8px",
//                                                 marginBottom: "10px",
//                                             }}
//                                         />
//                                     )}
//                                     <h3>{product.product_name}</h3>
//                                     <p style={{ fontSize: "14px", color: "#555" }}>
//                                         <strong>Description:</strong> {product.product_description}
//                                     </p>
//                                 </div>
//                             ))
//                         ) : (
//                             <p>No products found for {season}.</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default ProductPage;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TabsComponent from "./Tabs"; // Import the TabsComponent

function ProductPage() {
    const { season } = useParams();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("Unauthorized! Redirecting to login.");
                    navigate("/login");
                    return;
                }

                const response = await axios.get(`http://localhost:8080/api/products/${season}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
                alert("Failed to fetch products. Please try again.");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [season, navigate]);

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            {/* Tabs/Header */}
            <TabsComponent />
            
            {/* Page Content */}
            <div style={{ paddingTop: "64px", marginLeft: "15%", display: "flex", flexDirection: "row" }}>
                {/* Sidebar */}
                <div style={{ width: "30%", padding: "20px" }}>
                    <h2>{season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
                    <p>Browse the best products available for {season}.</p>
                </div>

                {/* Main Content */}
                <div style={{ width: "70%", padding: "20px" }}>
                    <div style={{ marginBottom: "20px", textAlign: "center" }}>
                        <h2>All {season.charAt(0).toUpperCase() + season.slice(1)} Products</h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        padding: "15px",
                                        textAlign: "center",
                                        backgroundColor: "#f9f9f9",
                                    }}
                                >
                                    {/* Image */}
                                    {product.product_image && (
                                        <img
                                            src={`http://localhost:8080/${product.product_image}`}
                                            alt={product.product_name}
                                            style={{
                                                width: "100%",
                                                height: "150px",
                                                objectFit: "cover",
                                                borderRadius: "8px",
                                                marginBottom: "10px",
                                            }}
                                        />
                                    )}
                                    {/* Product Details */}
                                    <h3>{product.product_name}</h3>
                                    <p style={{ fontSize: "14px", color: "#555" }}>
                                        <strong>Description:</strong> {product.product_description}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p>No products found for {season}.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductPage;
