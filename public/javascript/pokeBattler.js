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
function openPopupVS(compare_item_number, pokeGroup) {
  if (pokeGroup === 1) {
    document.getElementById("popup").style.display = "block";
  } else {
    document.getElementById("popupMyPokemons").style.display = "block";
  }
  document.getElementById("overlay").style.display = "block";
  const button = document.getElementById("button");
  button.className = `${compare_item_number}`;
  console.log(compare_item_number);
  console.log(button.className);
}

// Functie om de pop-up te sluiten
function closePopup(pokeGroup) {
  if (pokeGroup === 1) {
    document.getElementById("popup").style.display = "none";
  } else {
    document.getElementById("popupMyPokemons").style.display = "none";
  }
  document.getElementById("overlay").style.display = "none";
}

// Functie om een pokemon te selecteren
function selectPokemon(pokemonName) {
  alert(`Jij hebt ${pokemonName} geselecteerd`);
  closePopup(1);
  closePopup(2);
  const button = document.getElementById("button");
  fetchAndProcessSinglePokemonData(pokemonName).then((pokemon) => {
    switchToSelectedPokemon(pokemon, button.className);
  });
}

// Functie om een pokemon te selecteren
function switchToSelectedPokemon(pokemon, compareItemNumber) {
  const defaultElement = document.getElementById(
    `compare-item-${compareItemNumber}`
  );
  const article = document.createElement("article");
  article.className = "compare-item";
  article.innerHTML = `<figure>
  <img src="${pokemon.image}" width="200" height="200" />
  <figcaption>
    <h2> ${pokemon.name} </h2>
    <div style="display: flex; justify-content: center; margin: auto">
    <p style="width: 75%">Defense:</p>
    <div
      class="meter orange"
      style="width: 100%; margin: auto; margin-right: 10px">
      <span id="Poke-1-defense" style="width: ${pokemon.defense}%">${
    pokemon.defense
  }</span>
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin: auto">
    <p style="width: 75%">Attack:</p>
    <div
      class="meter"
      style="width: 100%; margin: auto; margin-right: 10px">
      <span id="Poke-1-attack" style="width: ${pokemon.attack}%">${
    pokemon.attack
  }</span>
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin: auto">
    <p style="width: 75%">Max HP:</p>
    <div
      class="meter red"
      style="width: 100%; margin: auto; margin-right: 10px">
      <span id="Poke-1-maxHP" style="width: ${pokemon.maxHP}%">${
    pokemon.maxHP
  }</span>
    </div>
  </div>
  <div style="display: flex; justify-content: center; margin: auto">
    <p style="width: 75%">Types:</p>
    <div style="width: 100%; margin: auto; margin-right: 10px; display: flex; justify-content: space-around;">
    ${pokemon.types
      .map(
        (type) => `<div class="type-icon type-${type}" href="">${type}</div>`
      )
      .join("")}
    </div>
  </div>
  </figcaption>
  <aside class="layer-close-button">
  <button onclick="openPopupVS(${compareItemNumber},${compareItemNumber})" type="submit">X</button>
  </aside>
  </figure>`;
  if (defaultElement) {
    defaultElement.replaceWith(article);
  } else {
    const defaultElement =
      document.getElementsByClassName("compare-item")[compareItemNumber - 1];
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

// Functie om twee Pokemons te vechten
function battleStart() {
  // const pokemon_1_ID = document.getElementById("pokemon_1");
  // const pokemon_2_ID = document.getElementById("pokemon_2");
  // fetchAndProcessSinglePokemonData(pokemon_1_ID).then((pokemon) => {
  //   switchToSelectedPokemon(pokemon);
  // });
  battleResult();
}
function battleResult() {
  const defaultElement = document.getElementById("popup-battle-result");
  defaultElement.innerHTML = `<h2 style = "  text-align: center;   text-transform: uppercase;
  ">charmeleon wint</h2>
  <img src="<%= pokemons[10].image %>" width="200" height="200" /> <br>
  <button onclick="battleEnd()" id="button">Pokémon Vangen</button> <br>
  `;
  // defaultElement.replaceWith(dialog);
  document.getElementById("popup-battle-result").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
function battleEnd() {
  location.reload();
}
