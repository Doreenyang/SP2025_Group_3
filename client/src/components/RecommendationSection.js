// components/RecommendationSection.jsx
import { getRecommendedProducts } from "./utils/tracking";
import { useEffect, useState } from "react";

// Simple fallback styles
const seasonStyles = {
    spring: { icon: '🌱' },
    summer: { icon: '☀️' },
    autumn: { icon: '🍂' },
    winter: { icon: '❄️' },
    all: { icon: '📦' }
  };
  
  export default function RecommendationSection({ allProducts }) {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
  
    useEffect(() => {
      try {
        const products = getRecommendedProducts(allProducts);
        setRecommendedProducts(products.slice(0, 4)); // Show top 4
      } catch (error) {
        console.error("Error getting recommendations", error);
        setRecommendedProducts([]);
      }
    }, [allProducts]);
  
    if (!recommendedProducts.length) return null;
  
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Recommended For You</h3>
        
        <div style={styles.grid}>
          {recommendedProducts.map(product => (
            <div key={product.id} style={styles.card}>
              <div style={styles.imageContainer}>
                {product.product_image ? (
                  <img 
                    src={product.fromCookie ? 
                      product.product_image : 
                      `http://localhost:8080/${product.product_image}`
                    }
                    alt={product.product_name}
                    style={styles.image}
                  />
                ) : (
                  <div style={styles.placeholder}>
                    {seasonStyles[product.season]?.icon || '📦'}
                  </div>
                )}
              </div>
              <div style={styles.info}>
                <h4 style={styles.name}>{product.product_name}</h4>
                <div style={styles.meta}>
                  <span style={styles.season}>{product.season || 'All seasons'}</span>
                  <button style={styles.button}>View</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  const styles = {
    container: {
      padding: '2rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      margin: '3rem 0',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
    },
    title: {
      marginTop: 0,
      marginBottom: '1.5rem',
      fontSize: '1.5rem',
      color: '#333',
      borderBottom: '2px solid #eee',
      paddingBottom: '0.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease',
      ':hover': {
        transform: 'translateY(-5px)'
      }
    },
    imageContainer: {
      height: '160px',
      overflow: 'hidden'
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    placeholder: {
      width: '100%',
      height: '100%',
      backgroundColor: '#eee',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      color: '#999'
    },
    info: {
      padding: '1rem'
    },
    name: {
      margin: '0 0 0.5rem 0',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    meta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    season: {
      fontSize: '0.8rem',
      color: '#666',
      textTransform: 'capitalize'
    },
    button: {
      padding: '0.3rem 0.8rem',
      backgroundColor: '#4a90e2',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }
  };