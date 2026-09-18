require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/events', require('./routes/events'));

// Serve built frontend in production
const frontendDist = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`StudManager backend running on http://localhost:${PORT}`);
});
