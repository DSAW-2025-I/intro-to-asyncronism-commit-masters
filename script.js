document.addEventListener('DOMContentLoaded', () => {
  loadAllPokemon();
  document.getElementById('searchButton').addEventListener('click', searchPokemon);
  document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchPokemon();
  });

  document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
  document.getElementById('nextPage').addEventListener('click', () => changePage(1));

  // Obtener el modal, tarjeta desplegable
  const modal = document.getElementById('pokemonModal');
  const span = document.getElementsByClassName('close')[0];

  // Cuando el usuario hace clic X cerrar modal
  span.onclick = function() {
    modal.style.display = 'none';
  }

  // Cerra modal con click fuera de la tarjeta
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});

let allPokemon = []; // Lista de todos los Pokemons
let filteredPokemon = []; // Lista de Pokemons filtrados
let currentPage = 1; // Página actual
const itemsPerPage = 50; // Número de Pokémon por página

// Cargar todos los Pokemons
function loadAllPokemon() {
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
    .then(response => response.json())
    .then(data => {
      const promises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()).catch(error => console.error('Error fetching Pokémon details:', error))); // Obtener detalles de cada Pokémon
      Promise.all(promises).then(results => {
        results.sort((a, b) => a.id - b.id); // Ordenar los resultados por ID
        allPokemon = results;
        filteredPokemon = allPokemon;
        displayPokemon();
      }).catch(error => console.error('Error:', error));
    })
    .catch(error => console.error('Error:', error));
}

// Mostrar los Pokemons en la pagina actual
function displayPokemon() {
  const container = document.getElementById('card-container');
  container.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedPokemon = filteredPokemon.slice(start, end);

  const promises = paginatedPokemon.map(pokemon => {
    const typePromises = pokemon.types.map(typeInfo => fetch(typeInfo.type.url).then(res => res.json()).catch(error => console.error('Error fetching type details:', error))); // Obtener información sobre un tipo de Pokémon
    return Promise.all(typePromises).then(types => {
      const typeElements = types.map(type => {
        const typeName = type.name;
        const typeColor = getTypeColor(typeName);
        return `<span class="type" style="background-color: ${typeColor};">${capitalizeFirstLetter(typeName)}</span>`;
      }).join(' ');
      const card = `
        <div class="card" onclick="showPokemonDetails(${pokemon.id})">
          <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}">
          <p>#${formatNumber(pokemon.id)}</p>
          <p>${capitalizeFirstLetter(pokemon.name)}</p>
          <p>Weight: ${pokemon.weight / 10} kg</p> <!-- Convertir el peso a kilogramos -->
          <div class="type-container">${typeElements}</div>
        </div>
      `;
      return card;
    }).catch(error => console.error('Error processing type data:', error));
  });

  Promise.all(promises).then(cards => { // Mostrar las tarjetas de los Pokemons
    container.innerHTML = cards.join('');
    updatePaginationButtons();
  }).catch(error => console.error('Error displaying Pokémon cards:', error));
}

// Actualizar los botones de paginacion
function updatePaginationButtons() {
  document.getElementById('prevPage').disabled = currentPage === 1;
  document.getElementById('nextPage').disabled = currentPage * itemsPerPage >= filteredPokemon.length;
}

// Cambiar de pagina
function changePage(direction) {
  currentPage += direction;
  displayPokemon();
}

// Mostrar los detalles de un Pokemons en una tarjeta desplegable
function showPokemonDetails(pokemonId) {
  fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    .then(response => response.json())
    .then(pokemon => {
      const types = pokemon.types.map(typeInfo => {
        const typeName = typeInfo.type.name;
        const typeColor = getTypeColor(typeName);
        return `<span class="type-modal" style="background-color: ${typeColor};">${capitalizeFirstLetter(typeName)}</span>`;
      }).join(' ');

      const abilities = pokemon.abilities.map(abilityInfo => {
        return capitalizeFirstLetter(abilityInfo.ability.name);
      }).join(', ');

      const details = `
        <p>#${formatNumber(pokemon.id)}</p>
        <p>${capitalizeFirstLetter(pokemon.name)}</p>
        <p>Weight: ${pokemon.weight / 10} kg</p>
        <p>Height: ${pokemon.height / 10} m</p>
        <p>Abilities: ${abilities}</p>
        <p>Type: ${types}</p>
      `;
      document.getElementById('pokemonImage').src = pokemon.sprites.other["showdown"].front_default;
      document.getElementById('pokemonInfo').innerHTML = details;

      // Obtener los colores de los tipos para la franja de la tarjeta desplegable
      const typeColors = pokemon.types.map(typeInfo => getTypeColor(typeInfo.type.name));
      document.documentElement.style.setProperty('--line-color1', typeColors[0]);
      document.documentElement.style.setProperty('--line-color2', typeColors[1] || typeColors[0]);

      document.getElementById('pokemonModal').style.display = 'block';
    })
    .catch(error => console.error('Error fetching Pokémon details:', error));
}

// Capitalizar la primera letra del nombre de un Pokemon
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Formatear el numero con ceros a la izquierda
function formatNumber(number) {
  return number.toString().padStart(4, '0');
}

// Obtener el color de un tipo de Pokemon
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

// Buscar un Pokemon en especifico
function searchPokemon() {
  const searchInput = document.getElementById('search').value.trim().toLowerCase();
  if (!searchInput) {
    filteredPokemon = allPokemon;
    currentPage = 1;
    displayPokemon(); // Si el campo de busqueda está vacio mostrar todos los Pokemons
    return;
  }

  const types = [
    "grass", "fire", "water", "bug", "normal", "poison", "electric", "ground",
    "fairy", "fighting", "psychic", "rock", "ghost", "ice", "dragon",
    "dark", "steel", "flying"
  ];

  if (types.includes(searchInput)) {
    // Buscar por tipo si coincide con la lista
    fetch(`https://pokeapi.co/api/v2/type/${searchInput}`)
      .then(response => response.json())
      .then(data => {
        const pokemonPromises = data.pokemon.map(p => fetch(p.pokemon.url).then(res => res.json()).catch(error => console.error('Error fetching Pokémon details:', error)));
        Promise.all(pokemonPromises).then(pokemons => {
          filteredPokemon = pokemons;
          currentPage = 1; // Resetear a la primera pagina
          displayPokemon();
        }).catch(error => console.error('Error processing Pokémon data:', error));
      })
      .catch(() => alert('Error al buscar por tipo.'));
  } else {
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchInput}`)
    .then(response => {
      if (!response.ok) throw new Error('No encontrado');
      return response.json();
    })
    .then(pokemon => {
      filteredPokemon = [pokemon];
      currentPage = 1; // Resetear a la primera pagina
      displayPokemon(); // Mostrar solo el Pokémon buscado
    })
    .catch(() => alert('Pokémon no encontrado. Intenta con otro nombre o número.'));
  }
}
