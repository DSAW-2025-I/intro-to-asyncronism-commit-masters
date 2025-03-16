let currentPage = 1; // Pagina actual
const limit = 12; // Limite de Pokemon por pagina

document.addEventListener('DOMContentLoaded', () => { // Cargar la lista de Pokemon al cargar la pagina
  loadPokemon(currentPage);
  document.getElementById('searchButton').addEventListener('click', searchPokemon);
  document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchPokemon();
  });

  const modal = document.getElementById('pokemonModal');
  const span = document.getElementsByClassName('close')[0];

  span.onclick = function() { // Cerrar la tarjeta al hacer click en la X
    modal.style.display = 'none';
  }

  window.onclick = function(event) { // Cerrar la tarjeta al hacer click fuera de ella
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});

function loadPokemon(page) {
  const offset = (page - 1) * limit;
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`) // Endpoint 1: Obtener la lista de Pokemon
    .then(response => response.json())
    .then(data => {
      const promises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json())); // Endpoint 2: Obtener detalles de un Pokemon en especifico
      Promise.all(promises).then(results => {
        results.sort((a, b) => a.id - b.id); // Ordenar los resultados por ID
        displayPokemon(results);
      });
    });
}

function displayPokemon(pokemons) { // Mostrar los Pokemon en la pagina
  const container = document.getElementById('card-container');
  container.innerHTML = '';
  const promises = pokemons.map(pokemon => {
    const typePromises = pokemon.types.map(typeInfo => fetch(typeInfo.type.url).then(res => res.json())); // Endpoint 3: Obtener informacion sobre un tipo de Pokemon
    return Promise.all(typePromises).then(types => {
      const typeElements = types.map(type => {
        const typeName = type.name;
        const typeColor = getTypeColor(typeName);
        return `<span class="type" style="background-color: ${typeColor};">${capitalizeFirstLetter(typeName)}</span>`;
      }).join(' ');
      const card = `
        <div class="card" onclick="showPokemonDetails(${pokemon.id})">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
          <p>#${formatNumber(pokemon.id)}</p>
          <p>${capitalizeFirstLetter(pokemon.name)}</p>
          <p>Weight: ${pokemon.weight}</p>
          <div class="type-container">${typeElements}</div>
        </div>
      `;
      return card;
    });
  });

  Promise.all(promises).then(cards => { // Mostrar las tarjetas de los Pokemon
    container.innerHTML = cards.join('');
  });
}

function showPokemonDetails(pokemonId) { // Mostrar los detalles de un Pokemon en una tarjeta desplagada
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(response => response.json())
    .then(pokemon => {
      const types = pokemon.types.map(typeInfo => typeInfo.type.name).join(', ');
      const details = `
        <p>#${formatNumber(pokemon.id)}</p>
        <p>${capitalizeFirstLetter(pokemon.name)}</p>
        <p>Weight: ${pokemon.weight}</p>
        <p>Height: ${pokemon.height}</p>
        <p>Base Experience: ${pokemon.base_experience}</p>
        <p>Type: ${types}</p>
      `;
      document.getElementById('pokemonImage').src = pokemon.sprites.front_default;
      document.getElementById('pokemonInfo').innerHTML = details;
      document.getElementById('pokemonModal').style.display = 'block';
    });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNumber(number) {
  return number.toString().padStart(4, '0');
}

function getTypeColor(type) { // Colores de los tipos de Pokemon
  const typeColors = {
    grass: '#83D66A',
    fire: '#FB8917',
    water: '#38BBEB',
    bug: '#A8B820',
    normal: '#A8A878',
    poison: '#A040A0',
    electric: '#F8D030',
    ground: '#E0C068',
    fairy: '#EE99AC',
    fighting: '#C03028',
    psychic: '#F85888',
    rock: '#B8A038',
    ghost: '#705898',
    ice: '#98D8D8',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    flying: '#A890F0'
  };
  return typeColors[type] || '#000000';
}

function nextPage() {
  currentPage++;
  loadPokemon(currentPage);
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadPokemon(currentPage);
  }
}

function searchPokemon() { // Buscar un Pokemon en especifico
  const searchInput = document.getElementById('search').value.trim().toLowerCase();
  if (!searchInput) {
    loadPokemon(currentPage); // Si el campo de busqueda esta vacio mostrar todos los Pokemon
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${searchInput}`)
    .then(response => {
      if (!response.ok) throw new Error('No encontrado');
      return response.json();
    })
    .then(pokemon => displayPokemon([pokemon])) // Mostrar solo el Pokemon buscado
    .catch(() => alert('Pokémon no encontrado. Intenta con otro nombre o número.'));
}
