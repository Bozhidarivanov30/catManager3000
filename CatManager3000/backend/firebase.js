const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json'); // Името на вашия файл

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://catmanager300.firebaseio.com" // Заменете с вашия project_id
});

const db = admin.firestore();
module.exports = db;