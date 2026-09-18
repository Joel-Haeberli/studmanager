const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/events.json');

function readEvents() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeEvents(events) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

router.use(auth);

router.get('/', (req, res) => {
  res.json(readEvents());
});

router.post('/', (req, res) => {
  const { title, type, category, startTime, endTime, date, weekdays, endDate, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  if (!type || !['one-time', 'periodic'].includes(type)) {
    return res.status(400).json({ error: 'type must be "one-time" or "periodic"' });
  }
  if (type === 'one-time' && !date) {
    return res.status(400).json({ error: 'date required for one-time events' });
  }
  if (type === 'periodic' && (!weekdays || !weekdays.length)) {
    return res.status(400).json({ error: 'weekdays required for periodic events' });
  }

  const event = {
    id: uuidv4(),
    title,
    type,
    category: category || 'study',
    startTime: startTime || null,
    endTime: endTime || null,
    ...(type === 'one-time' ? { date } : { weekdays, endDate: endDate || null }),
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  const events = readEvents();
  events.push(event);
  writeEvents(events);
  res.status(201).json(event);
});

router.put('/:id', (req, res) => {
  const events = readEvents();
  const idx = events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  events[idx] = { ...events[idx], ...req.body, id: events[idx].id };
  writeEvents(events);
  res.json(events[idx]);
});

router.delete('/:id', (req, res) => {
  const events = readEvents();
  const filtered = events.filter(e => e.id !== req.params.id);
  if (filtered.length === events.length) return res.status(404).json({ error: 'Not found' });
  writeEvents(filtered);
  res.json({ ok: true });
});

module.exports = router;
