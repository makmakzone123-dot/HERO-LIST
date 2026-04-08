const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'Ramos')));

const heroes = [
  { name: 'balmond', role: 'fighter' },
  { name: 'argus', role: 'fighter' },
  { name: 'eudora', role: 'mage' },
];
app.get('/api/heroes', (req, res) => {
  res.json(heroes);
});

app.post('/api/heroes', (req, res) => {
  const { name, role } = req.body;
  const newHero = { name, role };
  heroes.push(newHero);

  res.status(201).json({
    message: 'hero added succesfuly',
    hero: newHero,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
