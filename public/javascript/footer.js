async function fetchAndProcessSinglePokemonData(pokemonID) {
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon/${pokemonID}/#`
  );
  const singlePokemon = await response.json();
  const pokemonData = {
    id: singlePokemon.id,
    name: singlePokemon.name,
    types: singlePokemon.types.map((type) => type.type.name),
    image: singlePokemon.sprites.front_default,
    height: singlePokemon.height,
    weight: singlePokemon.weight,
    maxHP: singlePokemon.stats[0].base_stat,
    defense: singlePokemon.stats[2].base_stat,
    attack: singlePokemon.stats[1].base_stat,
  };
  return pokemonData;
}

// Functie om de pop-up te openen
function openPopupCurrentPokemon() {
  document.getElementById("popup-CurrentPokemon").style.display = "block";
  document.getElementById("overlay-CurrentPokemon").style.display = "block";
}

// Functie om de pop-up te sluiten
function closePopupCurrentPokemon() {
  document.getElementById("popup-CurrentPokemon").style.display = "none";
  document.getElementById("overlay-CurrentPokemon").style.display = "none";
}

function selectCurrentPokemon(pokemonName) {
  alert(`Jij hebt ${pokemonName} geselecteerd`);
  closePopupCurrentPokemon();
  fetchAndProcessSinglePokemonData(pokemonName).then((pokemon) => {
    switchToSelectedCurrentPokemon(pokemon);
  });
}

// Functie om een pokemon te selecteren
function switchToSelectedCurrentPokemon(pokemon) {
  var defaultElement = document.getElementById("current-pokemon");
  defaultElement.src = pokemon.image;
}

// Functie om een Pokemon op naam te filteren
function filterCurrentPokemonPokemonByName() {
  var input,
    filter,
    imageContainer,
    articles,
    figure,
    figcaption,
    p,
    i,
    txtValue;

  input = document.getElementById("myInputCurrentPokemon");
  filter = input.value.toUpperCase();
  imageContainer = document.getElementById("image-container-CurrentPokemon");
  articles = imageContainer.getElementsByTagName("article");

  for (i = 0; i < articles.length; i++) {
    figure = articles[i].getElementsByTagName("figure")[0];
    p = figure.getElementsByTagName("p")[0];
    txtValue = p.textContent || p.innerText;

    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      articles[i].style.display = "";
    } else {
      articles[i].style.display = "none";
    }
  }
}
