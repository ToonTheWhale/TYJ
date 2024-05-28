// const { info } = require("console");

// Functie om de pop-up te sluiten
function closePopup(side) {
  if (side) {
    document.getElementById(`overlay`).style.display = "none";
    document.getElementById(`popup-${side}`).style.display = "none";
    document.getElementById(`overlay-${side}`).style.display = "none";
  } else {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
  }
}
function closePopupCurrentPokemon() {
  document.getElementById("popup-CurrentPokemon").style.display = "none";
  document.getElementById("overlay-CurrentPokemon").style.display = "none";
}

// Functie om de pop-up te openen
function openPopup(side) {
  if (side) {
    document.getElementById(`popup-${side}`).style.display = "block";
    document.getElementById(`overlay`).style.display = "block";
  } else {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }
}
function openPopupCurrentPokemon() {
  document.getElementById("popup-CurrentPokemon").style.display = "block";
  document.getElementById("overlay-CurrentPokemon").style.display = "block";
}

// script dient voor de sidepdown nav
function openMenu() {
  document.getElementById("overlay-Menu").style.display = "flex";
}
function closeMenu() {
  document.getElementById("overlay-Menu").style.display = "none";
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

function filterPokemonByNameTwo() {
  var input,
    filter,
    imageContainer,
    articles,
    figure,
    figcaption,
    p,
    i,
    txtValue;

  input = document.getElementById("myInputTwo");
  filter = input.value.toUpperCase();
  imageContainer = document.getElementById("image-container-two");
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

function filterPokemonByNameCurrentPokemon() {
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

// function filterPokemonByNamePokedex() {
//   var input,
//     filter,
//     imageContainer,
//     articles,
//     figure,
//     figcaption,
//     p,
//     i,
//     txtValue;

//   input = document.getElementById("myInput");
//   filter = input.value.toUpperCase();
//   imageContainer = document.querySelector(".flex-container");
//   articles = imageContainer.getElementsByTagName("article");

//   for (i = 0; i < articles.length; i++) {
//     article = articles[0];
//     p = article.getElementsByTagName("p")[0];
//     txtValue = p.textContent || p.innerText;

//     if (txtValue.toUpperCase().indexOf(filter) > -1) {
//       articles[i].style.display = "";
//     } else {
//       articles[i].style.display = "none";
//     }
//   }
// }

function filterPokemon() {
  var input, filter, articles, p, i, txtValue;
  input = document.getElementById('pokemonFilter');
  filter = input.value.toUpperCase();
  articles = document.querySelectorAll('.pokemon');
  
  articles.forEach(function(article) {
    p = article.querySelector('p');
    txtValue = p.textContent || p.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      article.style.display = "";
    } else {
      article.style.display = "none";
    }
  });
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

// // Functie om de pop-up te sluiten
// function closePopup(pokeGroup) {
//   if (pokeGroup === 1) {
//     document.getElementById("popup").style.display = "none";
//   } else {
//     document.getElementById("popupMyPokemons").style.display = "none";
//   }
//   document.getElementById("overlay").style.display = "none";
// }

function closePopupMessageBattle(pokeGroup) {
  document.getElementById("popup-battle-message").style.display = "none";
  document.getElementById("overlay-battle-message").style.display = "none";
}

function openPopupMessage() {
  document.getElementById("popup-message").style.display = "block";
  document.getElementById("overlay-message").style.display = "block";

}

function closePopupMessage() {
  document.getElementById("popup-message").style.display = "none";
  document.getElementById("overlay-message").style.display = "none";
}

function closePopupMessageCurrentPokemon() {
  document.getElementById("popup-message-CurrentPokemon").style.display =
    "none";
  document.getElementById("overlay-message-CurrentPokemon").style.display =
    "none";
}

function PopupInfo() {
  document.getElementById("popupinfo").style.display = "block";
  document.getElementById("overlay-message").style.display = "block";
}

function closeinfo(){
  document.getElementById("popupinfo").style.display = "none";
  document.getElementById("overlay-message").style.display = "none";
}
