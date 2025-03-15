let currentPage = 1;
const limit = 12;

document.addEventListener('DOMContentLoaded', () => {
  loadPokemon(currentPage);
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

function displayPokemon(pokemons) {
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
      return `
        <div class="card">
          <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
          <p>#${formatNumber(pokemon.id)}</p>
          <p>${capitalizeFirstLetter(pokemon.name)}</p>
          <p>Weight: ${pokemon.weight}</p>
          <div class="type-container">${typeElements}</div>
        </div>
      `;
    });
  });

  Promise.all(promises).then(cards => {
    container.innerHTML = cards.join('');
  });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNumber(number) {
  return number.toString().padStart(4, '0');
}

function getTypeColor(type) {
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