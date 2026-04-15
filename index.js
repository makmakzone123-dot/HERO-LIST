const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Ramos')));

// Data
let characters = [
  { id: 1, name: 'Balmond', role: 'Fighter', difficulty: 'Medium', rating: 4.5 },
  { id: 2, name: 'Eudora', role: 'Mage', difficulty: 'Easy', rating: 4.2 },
  { id: 3, name: 'Argus', role: 'Fighter', difficulty: 'Medium', rating: 4.0 },
  { id: 4, name: 'Layla', role: 'Marksman', difficulty: 'Easy', rating: 4.1 }
];

// GET all
app.get('/api/characters', (req, res) => res.json(characters));

// GET by ID
app.get('/api/characters/:id', (req, res) => {
  const char = characters.find(c => c.id == req.params.id);
  if (!char) return res.status(404).json({ message: 'Not found' });
  res.json(char);
});

// ADD
app.post('/api/characters', (req, res) => {
  const { name, role, difficulty, rating } = req.body;

  if (!name || !role || !difficulty) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const newChar = {
    id: characters.length ? Math.max(...characters.map(c => c.id)) + 1 : 1,
    name,
    role,
    difficulty,
    rating: rating || 0
  };

  characters.push(newChar);
  res.json(newChar);
});

// UPDATE
app.put('/api/characters/:id', (req, res) => {
  const index = characters.findIndex(c => c.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Not found' });

  const { name, role, difficulty, rating } = req.body;

  characters[index] = {
    id: characters[index].id,
    name,
    role,
    difficulty,
    rating: rating || 0
  };

  res.json(characters[index]);
});

// DELETE ONE
app.delete('/api/characters/:id', (req, res) => {
  characters = characters.filter(c => c.id != req.params.id);
  res.json({ message: 'Deleted' });
});

// FILTER BY ROLE
app.get('/api/characters/role/:role', (req, res) => {
  const filtered = characters.filter(
    c => c.role.toLowerCase() === req.params.role.toLowerCase()
  );
  res.json(filtered);
});

// DELETE ALL BY ROLE
app.delete('/api/characters/role/:role', (req, res) => {
  const role = req.params.role.toLowerCase();

  characters = characters.filter(
    c => c.role.toLowerCase() !== role
  );

  res.json({ message: `All ${role} deleted` });
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));