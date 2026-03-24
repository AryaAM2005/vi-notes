const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../sessions.json');

// Ensure the local file exists at startup
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, JSON.stringify([]));
}

// Save a new session directly to the local sessions.json file
router.post('/', (req, res) => {
  try {
    const { name, notes } = req.body;
    
    const fileData = fs.readFileSync(dataFile, 'utf8');
    const sessions = JSON.parse(fileData);
    
    const newSession = {
      id: Date.now().toString(),
      name: name || 'Untitled Session',
      notes: notes || [],
      createdAt: new Date().toISOString()
    };
    
    sessions.push(newSession);
    fs.writeFileSync(dataFile, JSON.stringify(sessions, null, 2));
    
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retrieve all local sessions
router.get('/', (req, res) => {
  try {
    const fileData = fs.readFileSync(dataFile, 'utf8');
    const sessions = JSON.parse(fileData);
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
