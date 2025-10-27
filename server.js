const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Hello World from Codespaces!');
});

// New /score endpoint
app.get('/score', (req, res) => {
  const { corridor, density } = req.query;

  if (!corridor || !density) {
    return res.status(400).json({ error: 'Please provide corridor and density' });
  }

  const densityNum = Number(density);
  if (Number.isNaN(densityNum)) {
    return res.status(400).json({ error: 'Density must be numeric' });
  }

  // Simple scoring logic (replace with your real model later)
  const base = corridor.trim().length * 10;
  const score = base + densityNum * 100;

  res.json({ corridor, density: densityNum, score });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

