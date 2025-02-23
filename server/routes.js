const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config");
const router = express.Router();
const multer = require('multer');
const app = express();
const path = require('path');

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
        const [user] = await db.promise().query("SELECT username, created_at FROM users WHERE id = ?", [req.user.id]);

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

//Trading
//create trade requests (coin based)
router.post('/trade/request', authenticateToken, (req, res) => {
    const { receiverId, requestedItemId, coinsOffered } = req.body;
    const senderId = req.user.id; // Get sender_id from the authenticated user

    // Validate required fields
    if (!senderId || !receiverId || !requestedItemId || !coinsOffered) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (senderId === receiverId) {
        return res.status(400).json({ error: 'You cannot trade with yourself.' });
    }

    // Insert trade into the database
    const query = `
        INSERT INTO trades (sender_id, receiver_id, offered_item_id, requested_item_id, coins_offered, status)
        VALUES (?, ?, NULL, ?, ?, 'pending')
    `;

    db.query(query, [senderId, receiverId, requestedItemId, coinsOffered], (err, result) => {
        if (err) {
            console.error('Error creating trade:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ message: 'Trade request created successfully', tradeId: result.insertId });
    });
});


  //fetch all pending trade requests for user
  router.get('/trade/pending', authenticateToken, (req, res) => {
    const userId = req.user.id; 

    const query = `
        SELECT * FROM trades WHERE receiver_id = ? AND status = 'pending'
    `;

    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
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
  
  
  
  