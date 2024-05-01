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
    special_attack: singlePokemon.stats[3].base_stat,
    special_defense: singlePokemon.stats[4].base_stat,
    speed: singlePokemon.stats[5].base_stat,
  };
  return pokemonData;
}

async function fetchAndProcessTwoPokemonData(pokemonID1, pokemonID2) {
  try {
    // Fetch data for the first Pokemon
    const response1 = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonID1}/`
    );
    if (!response1.ok) {
      throw new Error(`Failed to fetch data for Pokemon ${pokemonID1}`);
    }
    const pokemonData1 = await response1.json();
    if (!pokemonData1) {
      throw new Error(`No data received for Pokemon ${pokemonID1}`);
    }

    // Fetch data for the second Pokemon
    const response2 = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonID2}/`
    );
    if (!response2.ok) {
      throw new Error(`Failed to fetch data for Pokemon ${pokemonID2}`);
    }
    const pokemonData2 = await response2.json();
    if (!pokemonData2) {
      throw new Error(`No data received for Pokemon ${pokemonID2}`);
    }

    // Process data for both Pokemon
    const processPokemonData = (pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types.map((type) => type.type.name),
      image: pokemon.sprites.front_default,
      height: pokemon.height,
      weight: pokemon.weight,
      maxHP: pokemon.stats[0].base_stat,
      defense: pokemon.stats[2].base_stat,
      attack: pokemon.stats[1].base_stat,
      special_attack: pokemon.stats[3].base_stat,
      special_defense: pokemon.stats[4].base_stat,
      speed: pokemon.stats[5].base_stat,
    });

    const processedPokemonData1 = processPokemonData(pokemonData1);
    const processedPokemonData2 = processPokemonData(pokemonData2);

    return [processedPokemonData1, processedPokemonData2];
  } catch (error) {
    console.error("Error fetching Pokemon data:", error);
    return null;
  }
}

// Functie om de pop-up te openen
function openPopupVS(compare_item_number) {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  const button = document.getElementById("button");
  button.className = `${compare_item_number}`;
  console.log(compare_item_number);
  console.log(button.className);
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
    <h2 id="pokemon_${compareItemNumber}_name"> ${pokemon.name} </h2>
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
  <button onclick="openPopupVS(${compareItemNumber})" type="submit">X</button>
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

// Functie om twee Pokemons te vergelijken
function compareStart() {
  const pokemon_1_name = document
    .getElementById("pokemon_1_name")
    .innerHTML.trim();
  const pokemon_2_name = document
    .getElementById("pokemon_2_name")
    .innerHTML.trim();
  if (pokemon_1_name && pokemon_2_name) {
    console.log(pokemon_1_name);
    console.log(pokemon_2_name);
    fetchAndProcessTwoPokemonData(pokemon_1_name, pokemon_2_name)
      .then(([pokemon1, pokemon2]) => {
        // console.log("Pokemon 1:", pokemon1);
        // console.log("Pokemon 2:", pokemon2);
        compareResult(pokemon1, pokemon2);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    alert(`Jij hebt nog geen Pokémons geselecteerd`);
  }
}
function compareResult(pokemon1, pokemon2) {
  const defaultElement = document.getElementById("popup-compare-result");
  defaultElement.innerHTML = `<button class="close_button" onclick="location.reload()" type="submit">
      <i class="fa fa-times" aria-hidden="true"></i> </button>
    <h2>Pokémon Vergelijking: ${pokemon1.name} vs ${pokemon2.name}</h2>
    <table>
        <tr>
            <th>Statistiek</th>
            <th>${pokemon1.name}</th>
            <th>${pokemon2.name}</th>
            <th>Verschil</th>
        </tr>
        <tr>
            <td>HP</td>
            <td>${pokemon1.maxHP}</td>
            <td>${pokemon2.maxHP}</td>
            <td class="${
              pokemon1.maxHP > pokemon2.maxHP
                ? "positive"
                : pokemon1.maxHP < pokemon2.maxHP
                ? "negative"
                : ""
            }">${pokemon1.maxHP - pokemon2.maxHP}</td>
        <tr>
            <td>Attack</td>
            <td>${pokemon1.attack}</td>
            <td>${pokemon2.attack}</td>
            <td class="${
              pokemon1.attack > pokemon2.attack
                ? "positive"
                : pokemon1.attack < pokemon2.attack
                ? "negative"
                : ""
            }">${pokemon1.attack - pokemon2.attack}</td>
        </tr>
        <tr>
            <td>Defense</td>
            <td>${pokemon1.defense}</td>
            <td>${pokemon2.defense}</td>
            <td class="${
              pokemon1.defense > pokemon2.defense
                ? "positive"
                : pokemon1.defense < pokemon2.defense
                ? "negative"
                : ""
            }">${pokemon1.defense - pokemon2.defense}</td>
        </tr>
        <tr>
            <td>Special Attack</td>
            <td>${pokemon1.special_attack}</td>
            <td>${pokemon2.special_attack}</td>
            <td class="${
              pokemon1.special_attack > pokemon2.special_attack
                ? "positive"
                : pokemon1.special_attack < pokemon2.special_attack
                ? "negative"
                : ""
            }">${pokemon1.special_attack - pokemon2.special_attack}</td>
        </tr>
        <tr>
            <td>Special Defense</td>
            <td>${pokemon1.special_defense}</td>
            <td>${pokemon2.special_defense}</td>
            <td class="${
              pokemon1.special_defense > pokemon2.special_defense
                ? "positive"
                : pokemon1.special_defense < pokemon2.special_defense
                ? "negative"
                : ""
            }">${pokemon1.special_defense - pokemon2.special_defense}</td>
        </tr>
        <tr>
            <td>Speed</td>
            <td>${pokemon1.speed}</td>
            <td>${pokemon2.speed}</td>
            <td class="${
              pokemon1.speed > pokemon2.speed
                ? "positive"
                : pokemon1.speed < pokemon2.speed
                ? "negative"
                : ""
            }">${pokemon1.speed - pokemon2.speed}</td>
        </tr>
    </table>
    `;

  // defaultElement.replaceWith(dialog);
  document.getElementById("popup-compare-result").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
