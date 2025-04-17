require('dotenv').config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config");
const router = express.Router();
const multer = require('multer');
const app = express();
const path = require('path');
const axios=require('axios');



// Middleware to authenticate tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid token." });
    }
};

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


//Configure storage for images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder to save images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save file with timestamp
    },
});

const upload = multer({ storage: storage });

// Register Route
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login attempt with email:", email);

    if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const [user] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        console.log("Database user query result:", user);

        if (user.length === 0) {
            console.log("User not found.");
            return res.status(404).json({ message: "User not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, user[0].password);
        console.log("Password validation result:", isPasswordValid);

        if (!isPasswordValid) {
            console.log("Invalid credentials.");
            return res.status(401).json({ message: "Invalid credentials." });
        }

        const token = jwt.sign(
            { id: user[0].id, email: user[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("Generated JWT:", token);

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});


// Dashboard Route (protected)
router.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to the dashboard page!", user: req.user });
});

//Dashboard submit
router.post('/submit-product', authenticateToken, upload.single('productImage'), async (req, res) => {
    const { productName, suitableSeason, productDescription } = req.body;
    const productImage = req.file ? req.file.path : null; 
    const owner_id = req.user.id;

    if (!productName || !suitableSeason || !productDescription) {
        return res.status(400).json({ message: 'All fields are required except the image.' });
    }
    if (!owner_id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const [result] = await db.promise().query(
            "INSERT INTO products (product_name, suitable_season, product_description, product_image, owner_id) VALUES (?, ?, ?, ?, ?)",
            [productName, suitableSeason, productDescription, productImage, owner_id]
        );

        res.status(201).json({ message: 'Product submitted successfully!', productId: result.insertId });
    } catch (error) {
        console.error("Error submitting product:", error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});




// Fetch Products by Season (protected)
router.get("/products/:season", authenticateToken, async (req, res) => {
    const { season } = req.params;

    try {
        // Query the database to fetch products for the given season
        const [rows] = await db.promise().query(
            "SELECT * FROM products WHERE suitable_season = ?",
            [season]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to fetch products." });
    }
});





// Profile Route (protected)
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const [user] = await db.promise().query("SELECT username FROM users WHERE id = ?", [req.user.id]);

        if (user.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.json({
            username: user[0].username,
            created_at: user[0].created_at,
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Failed to fetch profile." });
    }
});


// Category Route (protected)
router.get("/category", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to the category page!", user: req.user });
});

module.exports = router;


// Fetch All Products (public or protected based on your preference)
router.get("/products", authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM products");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ message: "Failed to fetch products." });
    }
});

// Update Profile Route (Partial Updates)
router.put("/update-profile", authenticateToken, async (req, res) => {
    const { field, value } = req.body;
    const userId = req.user.id; // Extracted from JWT token

    if (!field || !value) {
        return res.status(400).json({ message: "Field and value are required." });
    }

    try {
        const allowedFields = ["username", "email", "password"];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ message: "Invalid field." });
        }

        let updateQuery;
        let updateValues;

        if (field === "password") {
            const hashedPassword = await bcrypt.hash(value, 10);
            updateQuery = "UPDATE users SET password = ? WHERE id = ?";
            updateValues = [hashedPassword, userId];
        } else {
            updateQuery = `UPDATE users SET ${field} = ? WHERE id = ?`;
            updateValues = [value, userId];
        }

        await db.promise().query(updateQuery, updateValues);
        res.status(200).json({ message: `${field} updated successfully!` });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

router.get("/products", authenticateToken, async (req, res) => {
    console.log("User ID:", req.user.id);  // Log to see which user is making the request
    try {
        const [rows] = await db.promise().query("SELECT * FROM products WHERE owner_id = ?", [req.user.id]);
        console.log("Products fetched:", rows);  // Log to see what products are fetched
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching products for user:", error);
        res.status(500).json({ message: "Failed to fetch products." });
    }
});


//Trading
//create trade requests (coin based)
router.post('/trade/request', authenticateToken, (req, res) => {
    const { receiverId, requestedItemId, coinsOffered } = req.body;
    const senderId = req.user.id; // Get sender_id from the authenticated user

    // Validate required fields
    if (!senderId || !receiverId || !requestedItemId || !coinsOffered) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the sender is trying to trade with themselves
    if (senderId === receiverId) {
        return res.status(400).json({ error: 'You cannot trade with yourself.' });
    }

    // Check if the sender has enough coins
    const checkCoinsQuery = `
        SELECT coins FROM users WHERE id = ?
    `;

    db.query(checkCoinsQuery, [senderId], (err, results) => {
        if (err) {
            console.error('Error checking coin balance:', err);
            return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const senderCoins = results[0].coins;

        if (senderCoins < coinsOffered) {
            return res.status(400).json({ error: 'You do not have enough coins to make this trade.' });
        }

        // Insert trade into the database
        const insertTradeQuery = `
            INSERT INTO trades (sender_id, receiver_id, offered_item_id, requested_item_id, coins_offered, status)
            VALUES (?, ?, NULL, ?, ?, 'pending')
        `;

        db.query(insertTradeQuery, [senderId, receiverId, requestedItemId, coinsOffered], (err, result) => {
            if (err) {
                console.error('Error creating trade:', err);
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ message: 'Trade request created successfully', tradeId: result.insertId });
        });
    });
});



  // Assuming you have 'router' defined as an Express router and 'authenticateToken' as middleware to validate JWTs
    // router.get('/trades/pending', authenticateToken, async (req, res) => {
    //     try {
    //         // Example logic to fetch pending trades from a database
    //         const results = await db.promise().query('SELECT * FROM trades WHERE status = "pending" AND receiver_id = ?', [req.user.id]);
    //         res.json(results);
    //     } catch (error) {
    //         console.error("Error fetching pending trades:", error);
    //         res.status(500).json({ message: "Failed to fetch pending trades." });
    //     }
    // });
    router.get('/trades/pending', authenticateToken, async (req, res) => {
        try {
            const [results] = await db.promise().query(
                'SELECT * FROM trades WHERE status = "pending" AND receiver_id = ?',
                [req.user.id]
            );
            res.json(results);
        } catch (error) {
            console.error("Error fetching pending trades:", error);
            res.status(500).json({ message: "Failed to fetch pending trades." });
        }
    });
    



  //accept trade
  router.post('/trade/accept/:tradeId', authenticateToken, (req, res) => {
    const tradeId = req.params.tradeId;
    const userId = req.user.id; // Get user ID from JWT

    // Verify that the user is the receiver of the trade
    const verifyReceiverQuery = `
        SELECT * FROM trades WHERE id = ? AND receiver_id = ?
    `;

    db.query(verifyReceiverQuery, [tradeId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(403).json({ error: 'You are not authorized to accept this trade.' });
        }

        // Get a connection from the pool
        db.getConnection((err, connection) => {
            if (err) return res.status(500).json({ error: err.message });

            // Start transaction
            connection.beginTransaction(err => {
                if (err) {
                    connection.release(); // Release the connection back to the pool
                    return res.status(500).json({ error: err.message });
                }

                // Transfer ownership of the requested item
                const transferOwnershipQuery = `
                    UPDATE products
                    JOIN trades ON products.id = trades.requested_item_id
                    SET products.owner_id = trades.sender_id
                    WHERE trades.id = ?
                `;

                connection.query(transferOwnershipQuery, [tradeId], (err) => {
                    if (err) {
                        return connection.rollback(() => {
                            connection.release();
                            res.status(500).json({ error: err.message });
                        });
                    }

                    // Transfer ownership of the offered item (if any)
                    const transferOfferedItemQuery = `
                        UPDATE products
                        JOIN trades ON products.id = trades.offered_item_id
                        SET products.owner_id = trades.receiver_id
                        WHERE trades.id = ? AND trades.offered_item_id IS NOT NULL
                    `;

                    connection.query(transferOfferedItemQuery, [tradeId], (err) => {
                        if (err) {
                            return connection.rollback(() => {
                                connection.release();
                                res.status(500).json({ error: err.message });
                            });
                        }

                        // Deduct coins from the sender
                        const deductCoinsQuery = `
                            UPDATE users
                            SET coins = coins - (SELECT coins_offered FROM trades WHERE id = ?)
                            WHERE id = (SELECT sender_id FROM trades WHERE id = ?)
                        `;

                        connection.query(deductCoinsQuery, [tradeId, tradeId], (err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    connection.release();
                                    res.status(500).json({ error: err.message });
                                });
                            }

                            // Add coins to the receiver
                            const addCoinsQuery = `
                                UPDATE users
                                SET coins = coins + (SELECT coins_offered FROM trades WHERE id = ?)
                                WHERE id = (SELECT receiver_id FROM trades WHERE id = ?)
                            `;

                            connection.query(addCoinsQuery, [tradeId, tradeId], (err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        connection.release();
                                        res.status(500).json({ error: err.message });
                                    });
                                }

                                // Update trade status to 'accepted'
                                const updateTradeStatusQuery = `
                                    UPDATE trades SET status = 'accepted' WHERE id = ?
                                `;

                                connection.query(updateTradeStatusQuery, [tradeId], (err) => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            connection.release();
                                            res.status(500).json({ error: err.message });
                                        });
                                    }

                                    // Commit the transaction
                                    connection.commit(err => {
                                        if (err) {
                                            return connection.rollback(() => {
                                                connection.release();
                                                res.status(500).json({ error: err.message });
                                            });
                                        }

                                        connection.release(); // Release the connection back to the pool
                                        res.status(200).json({ message: 'Trade accepted and processed' });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

  //decline trade
  router.post('/trade/decline/:tradeId', authenticateToken, (req, res) => {
    const tradeId = req.params.tradeId;
    const userId = req.user.id; // Get user ID from JWT

    // Verify that the user is the receiver of the trade
    const verifyReceiverQuery = `
        SELECT * FROM trades WHERE id = ? AND receiver_id = ?
    `;

    db.query(verifyReceiverQuery, [tradeId, userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) {
            return res.status(403).json({ error: 'You are not authorized to decline this trade.' });
        }

        // Update trade status to 'declined'
        const query = `
            UPDATE trades SET status = 'declined' WHERE id = ?
        `;

        db.query(query, [tradeId], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json({ message: 'Trade declined successfully' });
        });
    });
});


  //fetch the current coin balance for a user
  router.get('/user/coins', authenticateToken, (req, res) => {
    const userId = req.user.id; 

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = 'SELECT coins FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ coins: result[0].coins });
    });
});

//eBay API
  
router.get('/ebay', async (req, res) => {
    try {
        const { keywords } = req.query;
        if (!keywords) {
            return res.status(400).json({ error: 'Keywords parameter is required' });
        }

        // Fetch multiple results (e.g., top 5)
        const response = await axios.get('https://svcs.sandbox.ebay.com/services/search/FindingService/v1', {
            params: {
                'OPERATION-NAME': 'findItemsByKeywords',
                'SERVICE-VERSION': '1.0.0',
                'SECURITY-APPNAME': 'DeyuanYa-CSE437Ke-SBX-4dec84694-700e3e2a', // Sandbox App ID
                'RESPONSE-DATA-FORMAT': 'JSON',
                'keywords': keywords,
                'paginationInput.entriesPerPage': 5 // Fetch top 5 results
            }
        });

        console.log('eBay API Response:', response.data);

        const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item;
        if (items && items.length > 0) {
            // Calculate the average price of the top results
            const totalPrice = items.reduce((sum, item) => {
                const price = parseFloat(item.sellingStatus[0].currentPrice[0].__value__);
                return sum + price;
            }, 0);

            const averagePrice = (totalPrice / items.length).toFixed(2); // Round to 2 decimal places
            res.json({ price: averagePrice });
        } else {
            res.status(404).json({ error: 'No items found on eBay' });
        }
    } catch (error) {
        console.error('Error fetching eBay data:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch eBay data', details: error.response?.data || error.message });
    }
});


// Send Message
router.post('/messages/send', authenticateToken, upload.single('image'), async (req, res) => {
    const { receiverId, productId } = req.body;
    const senderId = req.user.id;
    const content = req.body.content || '';
    const message_type = req.file ? 'image' : 'text';
    const image_path = req.file ? req.file.path : null;

    try {
        const [result] = await db.promise().query(
            "INSERT INTO messages (sender_id, receiver_id, product_id, content, message_type, image_path) VALUES (?, ?, ?, ?, ?, ?)",
            [senderId, receiverId, productId || null, content, message_type, image_path]
        );

        res.status(201).json({ 
            message: 'Message sent successfully',
            messageId: result.insertId 
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get Messages for Current User
router.get('/messages', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Get all messages where current user is either sender or receiver
        const [messages] = await db.promise().query(`
            SELECT m.*, 
                   u_sender.username as sender_username,
                   u_receiver.username as receiver_username,
                   p.product_name, p.product_image
            FROM messages m
            LEFT JOIN users u_sender ON m.sender_id = u_sender.id
            LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
            LEFT JOIN products p ON m.product_id = p.id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            ORDER BY m.created_at DESC
        `, [userId, userId]);

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Get Conversation between Two Users (optionally about a product)
// Update your conversation fetching endpoint
router.get('/messages/conversation/:otherUserId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const { productId } = req.query;

    try {
        let query = `
            SELECT m.*, 
                   u_sender.username as sender_username,
                   u_receiver.username as receiver_username,
                   p.product_name
            FROM messages m
            LEFT JOIN users u_sender ON m.sender_id = u_sender.id
            LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
            LEFT JOIN products p ON m.product_id = p.id
            WHERE ((m.sender_id = ? AND m.receiver_id = ?) 
                   OR (m.sender_id = ? AND m.receiver_id = ?))
        `;
        const queryParams = [userId, otherUserId, otherUserId, userId];

        if (productId) {
            query += ' AND m.product_id = ?';
            queryParams.push(productId);
        }

        query += ' ORDER BY m.created_at ASC';

        const [messages] = await db.promise().query(query, queryParams);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching conversation:', error);
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
});
// Mark Message as Read
router.put('/messages/:messageId/read', authenticateToken, async (req, res) => {
    const messageId = req.params.messageId;
    const userId = req.user.id;

    try {
        // Verify the message exists and the user is the receiver
        const [message] = await db.promise().query(
            'SELECT * FROM messages WHERE id = ? AND receiver_id = ?',
            [messageId, userId]
        );

        if (message.length === 0) {
            return res.status(404).json({ error: 'Message not found or unauthorized' });
        }

        // Update message as read
        await db.promise().query(
            'UPDATE messages SET is_read = TRUE WHERE id = ?',
            [messageId]
        );

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Failed to mark message as read' });
    }
});

// Get Unread Message Count
router.get('/messages/unread-count', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [result] = await db.promise().query(
            'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
            [userId]
        );

        res.status(200).json({ count: result[0].count });
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        res.status(500).json({ error: 'Failed to fetch unread message count' });
    }
});

// Mark multiple messages as read
router.put('/messages/mark-read', authenticateToken, async (req, res) => {
    const { senderId, productId } = req.body;
    const receiverId = req.user.id;

    try {
        let query = 'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?';
        const params = [senderId, receiverId];

        if (productId) {
            query += ' AND product_id = ?';
            params.push(productId);
        }

        await db.promise().query(query, params);
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

router.get('/messages/conversations', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [conversations] = await db.promise().query(`
            SELECT m.*, 
                   u_sender.username as sender_username,
                   u_receiver.username as receiver_username,
                   p.product_name
            FROM messages m
            LEFT JOIN users u_sender ON m.sender_id = u_sender.id
            LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
            LEFT JOIN products p ON m.product_id = p.id
            WHERE m.sender_id = ? OR m.receiver_id = ?
            ORDER BY m.created_at DESC
        `, [userId, userId]);

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});