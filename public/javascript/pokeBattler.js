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
function openPopupVS(compare_item_number) {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  const button = document.getElementById("button")
  button.className = `${compare_item_number}`;
  console.log(compare_item_number)
  console.log(button.className)
}

// Functie om de pop-up te sluiten
function closePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

// Functie om een pokemon te selecteren
function selectPokemon(pokemonName) {
  alert(`Jij hebt ${pokemonName} geselecteerd`);
  closePopup();
  const button = document.getElementById("button");
  fetchAndProcessSinglePokemonData(pokemonName).then((pokemon) => {
    switchToSelectedPokemon(pokemon,button.className);
  });
}

// Functie om een pokemon te selecteren
function switchToSelectedPokemon(pokemon,compareItemNumber) {
  const defaultElement = document.getElementById(`compare-item-${compareItemNumber}`);
  const article = document.createElement("article");
  article.className = "compare-item";
  article.innerHTML = `<figure>
    <img src="${pokemon.image}" width="200" height="200" />
    <figcaption>
      <h2> ${pokemon.name} </h2>
      <p>ID: ${pokemon.id} </p>
      <p>Defense: ${pokemon.defense} </p>
      <p>Attack: ${pokemon.attack} </p>
      <p>Types: ${pokemon.types} </p>
      <p>Max HP: ${pokemon.maxHP} </p>
    </figcaption>
    <aside class="layer-close-button">
    <button onclick="openPopupVS(${compareItemNumber})" type="submit">X</button>
    </aside>
    </figure>`;
  if (defaultElement) {
    defaultElement.replaceWith(article);
  } else {
    const defaultElement =
      document.getElementsByClassName("compare-item")[compareItemNumber-1];
    defaultElement.replaceWith(article);
  }
}

// Functie om een Pokemon op naam te filteren
function filterPokemonByName() {
  var input,filter,imageContainer,articles,figure,figcaption,p,i,txtValue;

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
  battleResult()
}
function battleResult() {
  const defaultElement = document.getElementById("popup-battle-result");
  defaultElement.innerHTML = 
  `<h2 style = "  text-align: center;   text-transform: uppercase;
  ">charmeleon wint</h2>
  <img src="<%= pokemons[1].image %>" width="200" height="200" /> <br>
  <button onclick="battleEnd()" id="button">Pokémon Vangen</button> <br>
  `;

 // defaultElement.replaceWith(dialog);
  document.getElementById("popup-battle-result").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
function battleEnd() {
  location.reload();
}