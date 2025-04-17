// components/CookieConsent.jsx
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!Cookies.get('cookie_consent')) {
      setVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set('cookie_consent', 'true', { expires: 365 });
    setVisible(false);
  };

  const declineCookies = () => {
    // Remove any existing tracking cookies
    Cookies.remove('user_preferences');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      maxWidth: '600px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
      zIndex: 1000
    }}>
      <h3 style={{ marginTop: 0 }}>Cookie Consent</h3>
      <p>
        We use cookies to personalize your experience and provide recommendations. 
        By continuing to browse, you agree to our use of cookies.
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={acceptCookies}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Accept
        </button>
        <button 
          onClick={declineCookies}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f1f1f1',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}