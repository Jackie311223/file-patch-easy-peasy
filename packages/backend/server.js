const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors({
  origin: ['http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181'], // Thêm cổng 5181
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Accept,Authorization',
  credentials: true
}));

app.use(express.json());

// Log incoming requests để kiểm tra
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@example.com' && password === '123456') {
    return res.json({
      user: { id: 1, email, name: 'Demo User' },
      token: 'demo-token'
    });
  }
  
  return res.status(401).json({ message: 'Invalid credentials' });
});

app.get('/', (req, res) => {
  res.send('API is running');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});