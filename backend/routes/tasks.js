const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/tasks.json');

function readTasks() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
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
  res.json(readTasks());
});

router.post('/', (req, res) => {
  const { title, category, dueDate, priority, notes } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  const task = {
    id: uuidv4(),
    title,
    category: category || 'study',
    dueDate: dueDate || null,
    priority: priority || 'medium',
    status: 'pending',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  const tasks = readTasks();
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const tasks = readTasks();
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  tasks[idx] = { ...tasks[idx], ...req.body, id: tasks[idx].id };
  writeTasks(tasks);
  res.json(tasks[idx]);
});

router.delete('/:id', (req, res) => {
  const tasks = readTasks();
  const filtered = tasks.filter(t => t.id !== req.params.id);
  if (filtered.length === tasks.length) return res.status(404).json({ error: 'Not found' });
  writeTasks(filtered);
  res.json({ ok: true });
});

module.exports = router;
