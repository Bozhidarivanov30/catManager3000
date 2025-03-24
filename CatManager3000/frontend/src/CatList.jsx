const CatList = ({ cats }) => {
    return (
      <div className="cat-list">
        <h2>Your Cats</h2>
        {cats.length === 0 ? (
          <p>No cats yet! Add your first cat.</p>
        ) : (
          <ul>
            {cats.map((cat) => (
              <li key={cat.id}>
                {cat.name} ({cat.age} years old) - {cat.breed}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  export default CatList;