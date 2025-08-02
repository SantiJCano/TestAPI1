const form = document.getElementById('searchForm');
const input = document.getElementById('pokemonInput');
const cardContainer = document.getElementById('pokemonCard');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  cardContainer.innerHTML = '<div class="spinner-border text-primary"></div>';

  try {
    const pokemon = await fetchPokemon(query);
    cardContainer.innerHTML = renderPokemonCard(pokemon);
  } catch (error) {
    cardContainer.innerHTML = `<div class="alert alert-danger">Pokémon no encontrado.</div>`;
  }
});

async function fetchPokemon(query) {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
  if (!res.ok) throw new Error('No encontrado');
  return await res.json();
}

function renderPokemonCard(pokemon) {
  return `
    <div class="card shadow">
      <img src="${pokemon.sprites.front_default}" class="card-img-top bg-secondary" alt="${pokemon.name}">
      <div class="card-body">
        <h5 class="card-title text-capitalize">${pokemon.name} (#${pokemon.id})</h5>
        <p><strong>Tipo:</strong> ${pokemon.types.map(t => t.type.name).join(', ')}</p>
        <p><strong>Habilidades:</strong> ${pokemon.abilities.map(a => a.ability.name).join(', ')}</p>
        <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
        <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
      </div>
    </div>
  `;
}