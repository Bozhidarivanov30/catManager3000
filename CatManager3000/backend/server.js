const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

let cats = []; // 🐱 In-memory база от данни

// 📍 GET /cats – Връща списък с всички котки.
app.get("/cats", (req, res) => {
  res.json(cats);
});

// 📍 POST /cats – Добавя нова котка.
app.post("/cats", (req, res) => {
  const { name, age, breed } = req.body;
  if (!name || !age || !breed) {
    return res.status(400).json({ error: "Name, age, and breed are required" });
  }
  const newCat = { id: uuidv4(), name, age, breed };
  cats.push(newCat);
  res.status(201).json(newCat);
});

// 📍 PUT /cats/:id – Редактира котка по ID.
app.put("/cats/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, breed } = req.body;
  const catIndex = cats.findIndex((cat) => cat.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: "Cat not found" });
  }
  cats[catIndex] = { ...cats[catIndex], name, age, breed };
  res.json(cats[catIndex]);
});

// 📍 DELETE /cats/:id – Изтрива котка по ID.
app.delete("/cats/:id", (req, res) => {
  const { id } = req.params;
  const catIndex = cats.findIndex((cat) => cat.id === id);
  if (catIndex === -1) {
    return res.status(404).json({ error: "Cat not found" });
  }
  cats.splice(catIndex, 1);
  res.status(204).send();
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));