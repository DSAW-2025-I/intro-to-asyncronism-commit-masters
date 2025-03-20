document.addEventListener('DOMContentLoaded', () => {
  loadAllPokemon();
  document.getElementById('searchButton').addEventListener('click', searchPokemon);
  document.getElementById('search').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') searchPokemon();
  });

  // Obtener el modal
  const modal = document.getElementById('pokemonModal');
  const span = document.getElementsByClassName('close')[0];

  // Cuando el usuario hace clic en <span> (x), cerrar el modal
  span.onclick = function() {
    modal.style.display = 'none';
  }

  // Cuando el usuario hace clic en cualquier lugar fuera del modal, cerrarlo
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});

function loadAllPokemon() {
  fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`) // Obtener todos los Pokémon (ajusta el límite según sea necesario)
    .then(response => response.json())
    .then(data => {
      const promises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json())); // Obtener detalles de cada Pokémon
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
    const typePromises = pokemon.types.map(typeInfo => fetch(typeInfo.type.url).then(res => res.json())); // Obtener información sobre un tipo de Pokémon
    return Promise.all(typePromises).then(types => {
      const typeElements = types.map(type => {
        const typeName = type.name;
        const typeColor = getTypeColor(typeName);
        return `<span class="type" style="background-color: ${typeColor};">${capitalizeFirstLetter(typeName)}</span>`;
      }).join(' ');
      const card = `
        <div class="card" onclick="showPokemonDetails(${pokemon.id})">
          <img src="${pokemon.sprites.other["showdown"].front_default}" alt="${pokemon.name}">
          <p>#${formatNumber(pokemon.id)}</p>
          <p>${capitalizeFirstLetter(pokemon.name)}</p>
          <p>Weight: ${pokemon.weight / 10} kg</p> <!-- Convertir el peso a kilogramos -->
          <div class="type-container">${typeElements}</div>
        </div>
      `;
      return card;
    });
  });

  Promise.all(promises).then(cards => { // Mostrar las tarjetas de los Pokémon
    container.innerHTML = cards.join('');
  });
}

function showPokemonDetails(pokemonId) { // Mostrar los detalles de un Pokémon en una tarjeta desplegable
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
        <p>Weight: ${pokemon.weight / 10} kg</p> <!-- Convertir el peso a kilogramos -->
        <p>Height: ${pokemon.height / 10} m</p> <!-- Convertir la altura a metros -->
        <p>Abilities: ${abilities}</p>
        <p>Type: ${types}</p>
      `;
      document.getElementById('pokemonImage').src = pokemon.sprites.other["showdown"].front_default;
      document.getElementById('pokemonInfo').innerHTML = details;

      // Obtener los colores de los tipos para la franja de la tarjeta
      const typeColors = pokemon.types.map(typeInfo => getTypeColor(typeInfo.type.name));
      document.documentElement.style.setProperty('--line-color1', typeColors[0]);
      document.documentElement.style.setProperty('--line-color2', typeColors[1] || typeColors[0]);

      document.getElementById('pokemonModal').style.display = 'block';
    });
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatNumber(number) {
  return number.toString().padStart(4, '0');
}

function getTypeColor(type) { // Colores de los tipos de Pokémon
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

function searchPokemon() { // Buscar un Pokémon en específico
  const searchInput = document.getElementById('search').value.trim().toLowerCase();
  if (!searchInput) {
    loadAllPokemon(); // Si el campo de búsqueda está vacío mostrar todos los Pokémon
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
        const pokemonPromises = data.pokemon.slice(0, 50).map(p => fetch(p.pokemon.url).then(res => res.json()));
        Promise.all(pokemonPromises).then(pokemons => {
          displayPokemon(pokemons);
        });
      })
      .catch(() => alert('Error al buscar por tipo.'));
  } else {
    fetch(`https://pokeapi.co/api/v2/pokemon/${searchInput}`)
    .then(response => {
      if (!response.ok) throw new Error('No encontrado');
      return response.json();
    })
    .then(pokemon => displayPokemon([pokemon])) // Mostrar solo el Pokémon buscado
    .catch(() => alert('Pokémon no encontrado. Intenta con otro nombre o número.'));
  }
}
