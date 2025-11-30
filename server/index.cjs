const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database.cjs');
// const { v4: uuidv4 } = require('uuid'); 
// Using crypto instead since we didn't install uuid
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5555;
const JWT_SECRET = 'your-secret-key-change-this-in-prod'; // Use env var in real app

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

app.use(cors());
app.use(express.json());

// Helper to generate ID
const generateId = () => crypto.randomUUID();

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Auth Routes ---

// Register
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = generateId();
    const createdAt = Date.now();

    db.run(`INSERT INTO users (id, username, password, created_at) VALUES (?, ?, ?, ?)`, 
        [id, username, hashedPassword, createdAt], 
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ id, username, createdAt });
        }
    );
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(400).json({ error: 'User not found' });

        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token, user: { id: user.id, username: user.username } });
        } else {
            res.status(400).json({ error: 'Invalid password' });
        }
    });
});

// --- Card Routes ---

// Get All Cards for User
app.get('/api/cards', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse tags JSON
        const cards = rows.map(card => ({
            ...card,
            tags: JSON.parse(card.tags || '[]')
        }));
        res.json(cards);
    });
});

// Create Card
app.post('/api/cards', authenticateToken, (req, res) => {
    const { title, category, content, tags } = req.body;
    const id = generateId();
    const now = Date.now();

    db.run(`INSERT INTO cards (id, user_id, title, category, content, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, req.user.id, title, category, content, JSON.stringify(tags || []), now, now],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id, user_id: req.user.id, title, category, content, tags: tags || [], created_at: now, updated_at: now });
        }
    );
});

// Update Card
app.put('/api/cards/:id', authenticateToken, (req, res) => {
    const { title, category, content, tags } = req.body;
    const now = Date.now();
    const cardId = req.params.id;

    // First check ownership
    db.get(`SELECT user_id FROM cards WHERE id = ?`, [cardId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Card not found' });
        if (row.user_id !== req.user.id) return res.sendStatus(403);

        db.run(`UPDATE cards SET title = ?, category = ?, content = ?, tags = ?, updated_at = ? WHERE id = ?`,
            [title, category, content, JSON.stringify(tags || []), now, cardId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: cardId, title, category, content, tags, updated_at: now });
            }
        );
    });
});

// Delete Card
app.delete('/api/cards/:id', authenticateToken, (req, res) => {
    const cardId = req.params.id;

    // First check ownership
    db.get(`SELECT user_id FROM cards WHERE id = ?`, [cardId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Card not found' });
        if (row.user_id !== req.user.id) return res.sendStatus(403);

        db.run(`DELETE FROM cards WHERE id = ?`, [cardId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted successfully' });
        });
    });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
