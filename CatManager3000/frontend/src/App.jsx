import React, { useState } from 'react';
import CatList from './CatList';
import CatForm from './CatForm';

const App = () => {
  const [cats, setCats] = useState([]);

  const addCat = (newCat) => {
    fetch('http://localhost:3000/cats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
      .then(response => response.json())
      .then(data => setCats([...cats, data]));
  };

  return (
    <div>
      <h1>Cat Manager 3000</h1>
      <CatForm onAddCat={addCat} />
      <CatList cats={cats} />
    </div>
  );
};

export default App;