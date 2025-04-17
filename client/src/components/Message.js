// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { FaEnvelope, FaCircle, FaSmile, FaPaperclip, FaTimes } from 'react-icons/fa';
// import EmojiPicker from 'emoji-picker-react';
// import ReactImageUploading from 'react-images-uploading';

// const Messages = ({ userId }) => {
//     const [conversations, setConversations] = useState([]);
//     const [selectedConversation, setSelectedConversation] = useState(null);
//     const [newMessage, setNewMessage] = useState('');
//     const [unreadCount, setUnreadCount] = useState(0);
//     const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//     const [images, setImages] = useState([]);
//     const fileInputRef = useRef(null);
//     const messagesEndRef = useRef(null);

//     // Auto-scroll to bottom of messages
//     const scrollToBottom = () => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     };

//     useEffect(() => {
//         fetchConversations();
//         const interval = setInterval(fetchConversations, 10000);
//         return () => clearInterval(interval);
//     }, [userId]);

//     useEffect(() => {
//         scrollToBottom();
//     }, [selectedConversation?.messages]);

//     const fetchConversations = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const response = await axios.get('http://localhost:8080/api/messages/conversations', {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
            
//             const processed = response.data.reduce((acc, msg) => {
//                 const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
//                 const existing = acc.find(c => c.otherUserId === otherUserId && c.productId === msg.product_id);
                
//                 if (existing) {
//                     if (!msg.is_read && msg.receiver_id === userId) {
//                         existing.unreadCount++;
//                     }
//                     if (new Date(msg.created_at) > new Date(existing.lastMessageTime)) {
//                         existing.lastMessage = msg.content;
//                         existing.lastMessageTime = msg.created_at;
//                         existing.lastMessageType = msg.message_type;
//                     }
//                 } else {
//                     acc.push({
//                         otherUserId,
//                         otherUsername: msg.sender_id === userId ? msg.receiver_username : msg.sender_username,
//                         productId: msg.product_id,
//                         productName: msg.product_name,
//                         lastMessage: msg.content,
//                         lastMessageType: msg.message_type,
//                         lastMessageTime: msg.created_at,
//                         unreadCount: (!msg.is_read && msg.receiver_id === userId) ? 1 : 0
//                     });
//                 }
//                 return acc;
//             }, []);
            
//             setConversations(processed);
//             setUnreadCount(processed.reduce((sum, conv) => sum + conv.unreadCount, 0));
//         } catch (error) {
//             console.error('Error fetching conversations:', error);
//         }
//     };

//     const fetchMessages = async (otherUserId, productId = null) => {
//         try {
//             const token = localStorage.getItem('token');
//             const url = productId 
//                 ? `http://localhost:8080/api/messages/conversation/${otherUserId}?productId=${productId}`
//                 : `http://localhost:8080/api/messages/conversation/${otherUserId}`;
            
//             const response = await axios.get(url, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
            
//             setSelectedConversation({
//                 otherUserId,
//                 otherUsername: response.data[0]?.sender_id === userId 
//                     ? response.data[0]?.receiver_username 
//                     : response.data[0]?.sender_username,
//                 productId,
//                 productName: response.data[0]?.product_name,
//                 messages: response.data
//             });
            
//             await axios.put(`http://localhost:8080/api/messages/mark-read`, {
//                 senderId: otherUserId,
//                 productId
//             }, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
            
//             fetchConversations();
//         } catch (error) {
//             console.error('Error fetching messages:', error);
//         }
//     };

//     const sendMessage = async () => {
//         if ((!newMessage.trim() && images.length === 0) || !selectedConversation) return;
        
//         try {
//             const token = localStorage.getItem('token');
//             const formData = new FormData();
            
//             formData.append('receiverId', selectedConversation.otherUserId);
//             formData.append('content', newMessage);
//             if (selectedConversation.productId) {
//                 formData.append('productId', selectedConversation.productId);
//             }
            
//             if (images.length > 0) {
//                 formData.append('image', images[0].file);
//             }
    
//             await axios.post('http://localhost:8080/api/messages/send', formData, {
//                 headers: { 
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });
            
//             setNewMessage('');
//             setImages([]);
//             fetchMessages(selectedConversation.otherUserId, selectedConversation.productId);
//         } catch (error) {
//             console.error('Error sending message:', error);
//             alert('Failed to send message. Please try again.');
//         }
//     };

//     const handleEmojiClick = (emojiData) => {
//         setNewMessage(prev => prev + emojiData.emoji);
//         setShowEmojiPicker(false);
//     };

//     const handleImageChange = (imageList) => {
//         setImages(imageList);
//     };

//     const renderLastMessage = (conv) => {
//         if (conv.lastMessageType === 'image') {
//             return '📷 Image';
//         }
//         return conv.lastMessage.length > 30 
//             ? `${conv.lastMessage.substring(0, 30)}...` 
//             : conv.lastMessage;
//     };

//     const renderMessageContent = (msg) => {
//         if (msg.message_type === 'image' && msg.image_path) {
//             return (
//                 <img 
//                     src={`http://localhost:8080/${msg.image_path}`}
//                     alt="Sent content"
//                     style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
//                 />
//             );
//         }
//         return msg.content;
//     };

//     return (
//         <div style={messagesContainerStyle}>
//             <div style={sidebarStyle}>
//                 <h3>
//                     <FaEnvelope /> Messages 
//                     {unreadCount > 0 && (
//                         <span style={unreadBadgeStyle}>{unreadCount}</span>
//                     )}
//                 </h3>
//                 <div style={conversationListStyle}>
//                     {conversations.map((conv, index) => (
//                         <div 
//                             key={index}
//                             style={{
//                                 ...conversationItemStyle,
//                                 ...(conv.unreadCount > 0 ? unreadConversationStyle : {})
//                             }}
//                             onClick={() => fetchMessages(conv.otherUserId, conv.productId)}
//                         >
//                             <div style={conversationHeaderStyle}>
//                                 <strong>{conv.otherUsername}</strong>
//                                 {conv.unreadCount > 0 && (
//                                     <FaCircle style={unreadDotStyle} />
//                                 )}
//                             </div>
//                             {conv.productName && (
//                                 <div style={productNameStyle}>About: {conv.productName}</div>
//                             )}
//                             <div style={lastMessageStyle}>
//                                 {renderLastMessage(conv)}
//                             </div>
//                             <div style={messageTimeStyle}>
//                                 {new Date(conv.lastMessageTime).toLocaleString()}
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
            
//             <div style={conversationStyle}>
//                 {selectedConversation ? (
//                     <>
//                         <h3>
//                             Conversation with {selectedConversation.otherUsername}
//                             {selectedConversation.productName && (
//                                 <span> about {selectedConversation.productName}</span>
//                             )}
//                         </h3>
                        
//                         <div style={messagesListStyle}>
//                             {selectedConversation.messages.map((msg, index) => (
//                                 <div 
//                                     key={index} 
//                                     style={{
//                                         ...messageBubbleStyle,
//                                         ...(msg.sender_id === userId ? sentBubbleStyle : receivedBubbleStyle)
//                                     }}
//                                 >
//                                     <div>{renderMessageContent(msg)}</div>
//                                     <div style={messageTimestampStyle}>
//                                         {new Date(msg.created_at).toLocaleTimeString()}
//                                     </div>
//                                 </div>
//                             ))}
//                             <div ref={messagesEndRef} />
//                         </div>
                        
//                         <div style={messageInputContainer}>
//                             {images.length > 0 && (
//                                 <div style={imagePreviewContainer}>
//                                     <img 
//                                         src={images[0].dataURL} 
//                                         alt="Preview" 
//                                         style={imagePreviewStyle}
//                                     />
//                                     <button 
//                                         onClick={() => setImages([])}
//                                         style={removeImageButton}
//                                     >
//                                         <FaTimes />
//                                     </button>
//                                 </div>
//                             )}
                            
//                             <div style={inputRowStyle}>
//                                 <button 
//                                     onClick={() => setShowEmojiPicker(!showEmojiPicker)}
//                                     style={emojiButtonStyle}
//                                 >
//                                     <FaSmile />
//                                 </button>
                                
//                                 {showEmojiPicker && (
//                                     <div style={emojiPickerContainer}>
//                                         <EmojiPicker onEmojiClick={handleEmojiClick} />
//                                     </div>
//                                 )}
                                
//                                 <ReactImageUploading
//                                     value={images}
//                                     onChange={handleImageChange}
//                                     maxNumber={1}
//                                     acceptType={['jpg', 'png', 'jpeg']}
//                                 >
//                                     {({ onImageUpload }) => (
//                                         <button 
//                                             onClick={onImageUpload}
//                                             style={attachButtonStyle}
//                                         >
//                                             <FaPaperclip />
//                                         </button>
//                                     )}
//                                 </ReactImageUploading>
                                
//                                 <textarea
//                                     value={newMessage}
//                                     onChange={(e) => setNewMessage(e.target.value)}
//                                     placeholder="Type your message here..."
//                                     style={messageInputStyle}
//                                     onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
//                                 />
                                
//                                 <button 
//                                     onClick={sendMessage}
//                                     style={sendButtonStyle}
//                                 >
//                                     Send
//                                 </button>
//                             </div>
//                         </div>
//                     </>
//                 ) : (
//                     <div style={noConversationStyle}>
//                         Select a conversation to start messaging
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// // Styles
// const messagesContainerStyle = {
//     display: 'flex',
//     height: '500px',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     backdropFilter: 'blur(10px)',
//     borderRadius: '10px',
//     overflow: 'hidden',
//     boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
//     margin: '20px 0',
//     color: '#fff'
// };

// const sidebarStyle = {
//     width: '300px',
//     borderRight: '1px solid rgba(255, 255, 255, 0.1)',
//     overflowY: 'auto',
//     padding: '15px'
// };

// const conversationListStyle = {
//     marginTop: '15px'
// };

// const conversationItemStyle = {
//     padding: '10px',
//     marginBottom: '10px',
//     borderRadius: '8px',
//     cursor: 'pointer',
//     transition: 'all 0.2s ease'
// };

// const unreadConversationStyle = {
//     backgroundColor: 'rgba(255, 71, 87, 0.1)',
//     borderLeft: '3px solid #ff4757'
// };

// const conversationHeaderStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     marginBottom: '5px'
// };

// const productNameStyle = {
//     fontSize: '12px',
//     color: '#888',
//     marginBottom: '5px'
// };

// const lastMessageStyle = {
//     fontSize: '14px',
//     whiteSpace: 'nowrap',
//     overflow: 'hidden',
//     textOverflow: 'ellipsis'
// };

// const messageTimeStyle = {
//     fontSize: '12px',
//     color: 'rgba(255, 255, 255, 0.7)',
//     textAlign: 'right'
// };

// const unreadBadgeStyle = {
//     backgroundColor: '#ff4757',
//     color: 'white',
//     borderRadius: '50%',
//     padding: '2px 6px',
//     fontSize: '12px',
//     marginLeft: '8px'
// };

// const unreadDotStyle = {
//     color: '#ff4757',
//     fontSize: '10px',
//     marginLeft: '8px'
// };

// const conversationStyle = {
//     flex: 1,
//     display: 'flex',
//     flexDirection: 'column',
//     padding: '15px'
// };

// const messagesListStyle = {
//     flex: 1,
//     overflowY: 'auto',
//     marginBottom: '15px',
//     padding: '10px',
//     backgroundColor: 'rgba(0, 0, 0, 0.1)',
//     borderRadius: '8px'
// };

// const messageBubbleStyle = {
//     padding: '8px 12px',
//     borderRadius: '18px',
//     marginBottom: '8px',
//     maxWidth: '70%',
//     wordWrap: 'break-word'
// };

// const sentBubbleStyle = {
//     backgroundColor: 'rgba(0, 123, 255, 0.3)',
//     marginLeft: 'auto',
//     borderBottomRightRadius: '2px'
// };

// const receivedBubbleStyle = {
//     backgroundColor: 'rgba(40, 167, 69, 0.3)',
//     marginRight: 'auto',
//     borderBottomLeftRadius: '2px'
// };

// const messageTimestampStyle = {
//     fontSize: '11px',
//     color: 'rgba(255, 255, 255, 0.6)',
//     textAlign: 'right',
//     marginTop: '4px'
// };

// const messageInputContainer = {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '10px'
// };

// const messageInputStyle = {
//     width: '100%',
//     minHeight: '80px',
//     padding: '10px',
//     borderRadius: '8px',
//     border: '1px solid rgba(255, 255, 255, 0.2)',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     color: '#fff',
//     resize: 'none'
// };

// const sendButtonStyle = {
//     padding: '8px 16px',
//     backgroundColor: '#4CAF50',
//     color: 'white',
//     border: 'none',
//     borderRadius: '5px',
//     cursor: 'pointer',
//     alignSelf: 'flex-end'
// };

// const noConversationStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '100%',
//     color: 'rgba(255, 255, 255, 0.5)'
// };

// const imagePreviewContainer = {
//     position: 'relative',
//     marginBottom: '10px'
// };

// const imagePreviewStyle = {
//     maxWidth: '200px',
//     maxHeight: '200px',
//     borderRadius: '8px',
//     border: '1px solid rgba(255, 255, 255, 0.2)'
// };

// const removeImageButton = {
//     position: 'absolute',
//     top: '5px',
//     right: '5px',
//     background: 'rgba(0, 0, 0, 0.7)',
//     border: 'none',
//     borderRadius: '50%',
//     color: 'white',
//     width: '24px',
//     height: '24px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     cursor: 'pointer'
// };

// const inputRowStyle = {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '10px'
// };

// const emojiButtonStyle = {
//     background: 'none',
//     border: 'none',
//     color: '#888',
//     fontSize: '20px',
//     cursor: 'pointer',
//     padding: '5px'
// };

// const emojiPickerContainer = {
//     position: 'absolute',
//     bottom: '80px',
//     zIndex: 100
// };

// const attachButtonStyle = {
//     background: 'none',
//     border: 'none',
//     color: '#888',
//     fontSize: '20px',
//     cursor: 'pointer',
//     padding: '5px'
// };

// export default Messages;

"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { FaEnvelope, FaCircle, FaSmile, FaPaperclip, FaTimes, FaTimesCircle } from "react-icons/fa"
import EmojiPicker from "emoji-picker-react"
import ReactImageUploading from "react-images-uploading"

const Messages = ({ userId, onClose }) => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [newMessage, setNewMessage] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [images, setImages] = useState([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:8080/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const processed = response.data.reduce((acc, msg) => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        const existing = acc.find((c) => c.otherUserId === otherUserId && c.productId === msg.product_id)

        if (existing) {
          if (!msg.is_read && msg.receiver_id === userId) {
            existing.unreadCount++
          }
          if (new Date(msg.created_at) > new Date(existing.lastMessageTime)) {
            existing.lastMessage = msg.content
            existing.lastMessageTime = msg.created_at
            existing.lastMessageType = msg.message_type
          }
        } else {
          acc.push({
            otherUserId,
            otherUsername: msg.sender_id === userId ? msg.receiver_username : msg.sender_username,
            productId: msg.product_id,
            productName: msg.product_name,
            lastMessage: msg.content,
            lastMessageType: msg.message_type,
            lastMessageTime: msg.created_at,
            unreadCount: !msg.is_read && msg.receiver_id === userId ? 1 : 0,
          })
        }
        return acc
      }, [])

      setConversations(processed)
      setUnreadCount(processed.reduce((sum, conv) => sum + conv.unreadCount, 0))
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }

  const fetchMessages = async (otherUserId, productId = null) => {
    try {
      const token = localStorage.getItem("token")
      const url = productId
        ? `http://localhost:8080/api/messages/conversation/${otherUserId}?productId=${productId}`
        : `http://localhost:8080/api/messages/conversation/${otherUserId}`

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setSelectedConversation({
        otherUserId,
        otherUsername:
          response.data[0]?.sender_id === userId
            ? response.data[0]?.receiver_username
            : response.data[0]?.sender_username,
        productId,
        productName: response.data[0]?.product_name,
        messages: response.data,
      })

      await axios.put(
        `http://localhost:8080/api/messages/mark-read`,
        {
          senderId: otherUserId,
          productId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      fetchConversations()
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const sendMessage = async () => {
    if ((!newMessage.trim() && images.length === 0) || !selectedConversation) return

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()

      formData.append("receiverId", selectedConversation.otherUserId)
      formData.append("content", newMessage)
      if (selectedConversation.productId) {
        formData.append("productId", selectedConversation.productId)
      }

      if (images.length > 0) {
        formData.append("image", images[0].file)
      }

      await axios.post("http://localhost:8080/api/messages/send", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      setNewMessage("")
      setImages([])
      fetchMessages(selectedConversation.otherUserId, selectedConversation.productId)
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    }
  }

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleImageChange = (imageList) => {
    setImages(imageList)
  }

  const renderLastMessage = (conv) => {
    if (conv.lastMessageType === "image") {
      return "📷 Image"
    }
    return conv.lastMessage.length > 30 ? `${conv.lastMessage.substring(0, 30)}...` : conv.lastMessage
  }

  const renderMessageContent = (msg) => {
    if (msg.message_type === "image" && msg.image_path) {
      return (
        <img
          src={`http://localhost:8080/${msg.image_path}`}
          alt="Sent content"
          style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "8px" }}
        />
      )
    }
    return msg.content
  }

  return (
    <div style={messagesContainerStyle}>
      {/* Close button in the top right corner */}
      <button onClick={onClose} style={closeButtonStyle} aria-label="Close messages">
        <FaTimesCircle />
      </button>

      <div style={sidebarStyle}>
        <h3>
          <FaEnvelope /> Messages
          {unreadCount > 0 && <span style={unreadBadgeStyle}>{unreadCount}</span>}
        </h3>
        <div style={conversationListStyle}>
          {conversations.map((conv, index) => (
            <div
              key={index}
              style={{
                ...conversationItemStyle,
                ...(conv.unreadCount > 0 ? unreadConversationStyle : {}),
                ...(selectedConversation?.otherUserId === conv.otherUserId && 
                  selectedConversation?.productId === conv.productId ? selectedConversationStyle : {})
              }}
              onClick={() => fetchMessages(conv.otherUserId, conv.productId)}
            >
              <div style={conversationHeaderStyle}>
                <strong>{conv.otherUsername}</strong>
                {conv.unreadCount > 0 && <FaCircle style={unreadDotStyle} />}
              </div>
              {conv.productName && <div style={productNameStyle}>About: {conv.productName}</div>}
              <div style={lastMessageStyle}>{renderLastMessage(conv)}</div>
              <div style={messageTimeStyle}>{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={conversationStyle}>
        {selectedConversation ? (
          <>
            <h3>
              Conversation with {selectedConversation.otherUsername}
              {selectedConversation.productName && <span> about {selectedConversation.productName}</span>}
            </h3>

            <div style={messagesListStyle}>
              {selectedConversation.messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    ...messageBubbleStyle,
                    ...(msg.sender_id === userId ? sentBubbleStyle : receivedBubbleStyle),
                  }}
                >
                  <div>{renderMessageContent(msg)}</div>
                  <div style={messageTimestampStyle}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={messageInputContainer}>
              {images.length > 0 && (
                <div style={imagePreviewContainer}>
                  <img src={images[0].dataURL || "/placeholder.svg"} alt="Preview" style={imagePreviewStyle} />
                  <button onClick={() => setImages([])} style={removeImageButton}>
                    <FaTimes />
                  </button>
                </div>
              )}

              <div style={inputRowStyle}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={emojiButtonStyle}>
                  <FaSmile />
                </button>

                {showEmojiPicker && (
                  <div style={emojiPickerContainer}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                <ReactImageUploading
                  value={images}
                  onChange={handleImageChange}
                  maxNumber={1}
                  acceptType={["jpg", "png", "jpeg"]}
                >
                  {({ onImageUpload }) => (
                    <button onClick={onImageUpload} style={attachButtonStyle}>
                      <FaPaperclip />
                    </button>
                  )}
                </ReactImageUploading>

                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  style={messageInputStyle}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                />

                <button onClick={sendMessage} style={sendButtonStyle}>
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={noConversationStyle}>Select a conversation to start messaging</div>
        )}
      </div>
    </div>
  )
}

// Styles
const messagesContainerStyle = {
  display: "flex",
  width: "100%", // Ensure it takes full width
  height: "80vh", // Use viewport height instead of fixed pixels
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderRadius: "10px",
  overflow: "hidden",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  color: "#fff",
  position: "relative",
}

// New close button style
const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "transparent",
  border: "none",
  color: "#fff",
  fontSize: "20px",
  cursor: "pointer",
  zIndex: 10,
  padding: "5px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  width: "30px",
  height: "30px",
  transition: "all 0.2s ease",
  ":hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    transform: "scale(1.1)",
  },
}

const sidebarStyle = {
  width: "30%",
  minWidth: "250px",
  borderRight: "1px solid rgba(255, 255, 255, 0.15)",
  overflowY: "auto",
  padding: "15px",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
}

const conversationListStyle = {
  marginTop: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
}

const conversationItemStyle = {
  padding: "12px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  }
}

const selectedConversationStyle = {
  backgroundColor: "rgba(0, 123, 255, 0.15)",
  border: "1px solid rgba(0, 123, 255, 0.3)",
}

const unreadConversationStyle = {
  backgroundColor: "rgba(255, 71, 87, 0.1)",
  borderLeft: "3px solid #ff4757",
}

const conversationHeaderStyle = {
  display: "flex",
  alignItems: "center",
  marginBottom: "5px",
}

const productNameStyle = {
  fontSize: "12px",
  color: "#888",
  marginBottom: "5px",
}

const lastMessageStyle = {
  fontSize: "14px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}

const messageTimeStyle = {
  fontSize: "12px",
  color: "rgba(255, 255, 255, 0.7)",
  textAlign: "right",
}

const unreadBadgeStyle = {
  backgroundColor: "#ff4757",
  color: "white",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: "12px",
  marginLeft: "8px",
}

const unreadDotStyle = {
  color: "#ff4757",
  fontSize: "10px",
  marginLeft: "8px",
}

const conversationStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  padding: "15px",
  minWidth: "300px", // Ensure conversation area has minimum width
}

const messagesListStyle = {
  flex: 1,
  overflowY: "auto",
  marginBottom: "15px",
  padding: "10px",
  backgroundColor: "rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "10px", // Add gap between messages
}
const messageBubbleStyle = {
  padding: "8px 12px",
  borderRadius: "18px",
  marginBottom: "8px",
  maxWidth: "80%", // Slightly increased max width
  wordWrap: "break-word",
  position: "relative",
}

const sentBubbleStyle = {
  backgroundColor: "rgba(0, 123, 255, 0.3)",
  marginLeft: "auto",
  marginRight: "10px", // Add some right margin
  borderBottomRightRadius: "2px",
}

const receivedBubbleStyle = {
  backgroundColor: "rgba(40, 167, 69, 0.3)",
  marginRight: "auto",
  marginLeft: "10px", // Add some left margin
  borderBottomLeftRadius: "2px",
}
const messageTimestampStyle = {
  fontSize: "11px",
  color: "rgba(255, 255, 255, 0.6)",
  textAlign: "right",
  marginTop: "4px",
}

const messageInputContainer = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
}

const messageInputStyle = {
  flex: 1, // Take remaining space
  minHeight: "80px",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  resize: "none",
}

const sendButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  alignSelf: "flex-end",
}

const noConversationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  color: "rgba(255, 255, 255, 0.5)",
}

const imagePreviewContainer = {
  position: "relative",
  marginBottom: "10px",
}

const imagePreviewStyle = {
  maxWidth: "200px",
  maxHeight: "200px",
  borderRadius: "8px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
}

const removeImageButton = {
  position: "absolute",
  top: "5px",
  right: "5px",
  background: "rgba(0, 0, 0, 0.7)",
  border: "none",
  borderRadius: "50%",
  color: "white",
  width: "24px",
  height: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
}

const inputRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%", // Ensure it takes full width
}



const emojiButtonStyle = {
  background: "none",
  border: "none",
  color: "#888",
  fontSize: "20px",
  cursor: "pointer",
  padding: "5px",
}

const emojiPickerContainer = {
  position: "absolute",
  bottom: "80px",
  zIndex: 100,
}

const attachButtonStyle = {
  background: "none",
  border: "none",
  color: "#888",
  fontSize: "20px",
  cursor: "pointer",
  padding: "5px",
}

export default Messages