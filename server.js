const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Path to JSON file
const DATA_FILE = path.join(__dirname, 'scores.json');

// Utility: load scores
function loadScores() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

// Utility: save scores
function saveScores(scores) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(scores, null, 2));
}

// /score endpoint: calculate + save
app.get('/score', (req, res) => {
  const { corridor, density } = req.query;

  if (!corridor || !density || isNaN(density)) {
    return res.status(400).json({ error: 'Missing or invalid parameters' });
  }

  const densityNum = parseFloat(density);
  const base = corridor.trim().length * 10;
  const score = base + densityNum * 100;

  const entry = {
    corridor,
    density: densityNum,
    score,
    timestamp: new Date().toISOString()
  };

  const scores = loadScores();
  scores.push(entry);
  saveScores(scores);

  res.json(entry);
});

// /scores endpoint: retrieve all
app.get('/scores', (req, res) => {
  const scores = loadScores();
  res.json(scores);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
