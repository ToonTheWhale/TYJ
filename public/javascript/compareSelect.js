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
  function selectPokemon(pokemonName) {
    alert(`Jij hebt ${pokemonName} geselecteerd`);
    closePopup();
    fetchAndProcessSinglePokemonData(pokemonName).then((pokemon) => {
      switchToSelectedPokemon(pokemon);
    });
  }

  // Functie om een pokemon te selecteren
  function switchToSelectedPokemon(pokemon) {
    const defaultElement = document.getElementById("compare-item-1");
    const article = document.createElement("article");
    article.className = "compare-item";
    article.innerHTML = `<figure>
      <img src="${pokemon.image}" width="200" height="200" />
      <figcaption>
        <h2> ${pokemon.name} </h2>
        <p id = "pokemon_1" >ID: ${pokemon.id} </p>
        <p>Defense: ${pokemon.defense} </p>
        <p>Attack: ${pokemon.attack} </p>
        <p>Types: ${pokemon.types} </p>
        <p>Max HP: ${pokemon.maxHP} </p>
      </figcaption>
      <aside class="layer-close-button">
      <button onclick="openPopup()" type="submit">X</button>
      </aside>
      </figure>`;
    if (defaultElement) {
      defaultElement.replaceWith(article);
    } else {
      const defaultElement =
        document.getElementsByClassName("compare-item")[0];
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
    // const pokemon_1_ID = document.getElementById("pokemon_1");
    // const pokemon_2_ID = document.getElementById("pokemon_2");
    // fetchAndProcessSinglePokemonData(pokemon_1_ID).then((pokemon) => {
    //   switchToSelectedPokemon(pokemon);
    // });
    compareResult();
  }
  function compareResult() {
    const defaultElement = document.getElementById("popup-compare-result");
    defaultElement.innerHTML = `
    <button class="close_button" onclick="location.reload()" type="submit">
      <i class="fa fa-times" aria-hidden="true"></i> </button>
    <h2>Pokémon Vergelijking: Charmeleon vs Ivysaur</h2>
    <table>
        <tr>
            <th>Statistiek</th>
            <th>Charmeleon</th>
            <th>Ivysaur</th>
            <th>Verschil</th>
        </tr>
        <tr>
            <td>HP</td>
            <td>58</td>
            <td>60</td>
            <td class="negative">-2</td>
        </tr>
        <tr>
            <td>Attack</td>
            <td>64</td>
            <td>62</td>
            <td class="positive">+2</td>
        </tr>
        <tr>
            <td>Defense</td>
            <td>58</td>
            <td>63</td>
            <td class="negative">-5</td>
        </tr>
        <tr>
            <td>Special Attack</td>
            <td>80</td>
            <td>80</td>
            <td>0</td>
        </tr>
        <tr>
            <td>Special Defense</td>
            <td>65</td>
            <td>80</td>
            <td class="negative">-15</td>
        </tr>
        <tr>
            <td>Speed</td>
            <td>80</td>
            <td>60</td>
            <td class="positive">+20</td>
        </tr>
    </table>
    `;

    // defaultElement.replaceWith(dialog);
    document.getElementById("popup-compare-result").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }
