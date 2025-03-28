const express = require('express');
const cors = require('cors');
const db = require('./firebase');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// 🐱 CRUD Endpoints

// GET всички котки (с пагинация)
app.get('/cats', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const snapshot = await db.collection('cats')
                          .limit(parseInt(limit))
                          .offset((parseInt(page) - 1) * parseInt(limit))
                          .get();
    
    const cats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null
    }));

    res.json({
      data: cats,
      meta: {
        total: (await db.collection('cats').count().get()).data().count,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting cats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST нова котка (с валидация)
app.post('/cats', async (req, res) => {
  try {
    const { name, age, breed } = req.body;

    if (!name || !age || !breed) {
      return res.status(400).json({ error: 'Name, age and breed are required' });
    }

    if (typeof age !== 'number' || age < 0 || age > 30) {
      return res.status(400).json({ error: 'Age must be a number between 0 and 30' });
    }

    const docRef = await db.collection('cats').add({
      name,
      age,
      breed,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      id: docRef.id,
      name,
      age,
      breed,
      message: 'Cat created successfully'
    });
  } catch (error) {
    console.error('Error creating cat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT редактиране на котка (частично обновяване)
app.put('/cats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, breed } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Cat ID is required' });
    }

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (breed) updateData.breed = breed;

    await db.collection('cats').doc(id).update(updateData);

    const updatedCat = (await db.collection('cats').doc(id).get()).data();

    res.json({
      id,
      ...updatedCat,
      createdAt: updatedCat.createdAt?.toDate() || null,
      updatedAt: updatedCat.updatedAt?.toDate() || null,
      message: 'Cat updated successfully'
    });
  } catch (error) {
    console.error('Error updating cat:', error);
    
    if (error.code === 5) { // NOT_FOUND
      return res.status(404).json({ error: 'Cat not found' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE котка (с проверка за съществуване)
app.delete('/cats/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await db.collection('cats').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Cat not found' });
    }

    await db.collection('cats').doc(id).delete();
    
    res.status(200).json({
      id,
      message: 'Cat deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Firestore connected to project: ${process.env.GCLOUD_PROJECT || 'catmanager300'}`);
});