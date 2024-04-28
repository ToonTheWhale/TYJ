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
function openPopup() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

// Functie om de pop-up te sluiten
function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

// Functie om een pokemon te selecteren
function selectPokemonSinglePokemonData(pokemonName) {
  alert(`Jij hebt ${pokemonName} geselecteerd`);
  closePopup();
  fetchAndProcessSinglePokemonData(pokemonName).then((pokemon) => {
    switchToSelectedPokemon(pokemon);
  });
}

function RandomNumber() {
  return Math.floor(Math.random() * 151);
}

function selectRandomPokemon() {
  selectPokemonSinglePokemonData(RandomNumber());
}

// Functie om een pokemon te selecteren
function switchToSelectedPokemon(pokemon) {
  const defaultElement = document.getElementById("flex-container-sengle-item");
  const article = document.createElement("article");
  article.className = "flex-container-sengle-item";
  article.innerHTML = `
    <section style="position: relative;">
        <article>
            <figure>
            <h2> ${pokemon.name} </h2>
            <img src="${pokemon.image}" />
            </figure>
            <aside class="layer-close-button">
            <button style="margin: 15px;" onclick="openPopup()" type="submit"><i class="fa fa-times" aria-hidden="true"></i></button>
            </aside>
        </a>
            <button
                type="submit"
                class="pokeball"
                id="pokeball"
                style="animation: none; position: absolute; bottom: -25%; left: 25%"
            ></button>
        </article>
    </section>
    `;
  if (defaultElement) {
    defaultElement.replaceWith(article);
  } else {
    const defaultElement = document.getElementsByClassName(
      "flex-container-sengle-item"
    )[0];
    defaultElement.replaceWith(article);
  }
}

// Functie om een Pokemon op naam te filteren
function filterPokemonByName() {
  var input,
    filter,
    imageContainer,
    articles,
    figure,
    figcaption,
    p,
    i,
    txtValue;

  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  imageContainer = document.querySelector(".image-container");
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
