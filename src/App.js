import React, { useEffect, useState } from "react";
import "./App.css";

function getIdFromUrl(url) {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

function PokemonCard({ name, id }) {
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  
  return (
    <div className="card">
      <img src={imageUrl} alt={name} className="pokemon-img" />
      <h3 className="pokemon-name">{name}</h3>
      <p className="pokemon-id">#{id}</p>
    </div>
  );
}

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const baseUrl = "https://pokeapi.co/api/v2/pokemon?limit=20";

  useEffect(() => {
    fetchList(baseUrl);
  }, []);

  async function fetchList(url) {
    setLoading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error en la API");
      const data = await res.json();
      
      const mapped = data.results.map(p => ({
        name: p.name,
        id: getIdFromUrl(p.url),
      }));
      
      setPokemons(mapped);
      setNextUrl(data.next);
      setPrevUrl(data.previous);
      
      // Actualizar página actual basado en la URL
      if (url.includes('offset=')) {
        const offset = new URL(url).searchParams.get('offset');
        setCurrentPage(parseInt(offset) / 20 + 1);
      } else {
        setCurrentPage(1);
      }
    } catch (err) {
      console.error(err);
      setPokemons([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>PokéPWA</h1>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="loading">Cargando pokémon</div>
        ) : (
          <>
            <div className="grid">
              {pokemons.map(p => (
                <PokemonCard key={p.id} name={p.name} id={p.id} />
              ))}
            </div>

            <div className="pagination">
              <button 
                onClick={() => fetchList(prevUrl)} 
                disabled={!prevUrl}
              >
                ← Anterior
              </button>
              
              <span className="page-info">
                Página {currentPage}
              </span>
              
              <button 
                onClick={() => fetchList(nextUrl)} 
                disabled={!nextUrl}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </main>

      <footer>
        <small>PokéPWA - Demo de PWA con fetch a pokeapi.co</small>
      </footer>
    </div>
  );
}

export default App;
