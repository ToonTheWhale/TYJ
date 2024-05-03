import express from "express";
import { getEnabledCategories } from "trace_events";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("port", 3000);

interface NonDetailedPokemon {
  name: string;
  url: string;
}

interface DetailedPokemon {
  id: number;
  name: string;
  types: string[];
  image: string;
  height: number;
  weight: number;
  maxHP: number;
  defense: number;
  attack: number;
  nickname: string;
}

let pokemons: DetailedPokemon[] = [];
let playerPokemons: DetailedPokemon[] = [];
let currentPokemon: DetailedPokemon | undefined;

function randomIntFromInterval(min: number, max: number) {
  //functie voor een random getal met 2 parameters
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//functie om een pokemon te vangen
function catchPokemon(
  targetPokemon: DetailedPokemon,
  currentPokemon: DetailedPokemon
): boolean {
  const catchPercentage = 100 - targetPokemon.defense + currentPokemon.attack;
  let caught = false;
  const random = randomIntFromInterval(1, 100);
  // console.log(random, catchPercentage);
  if (random <= catchPercentage) {
    caught = true;
  }

  return caught;
}

// Functie voor het simuleren van een gevecht tussen twee Pokémons
function battlePokemon(
  yourPokemon: DetailedPokemon,
  opponentPokemon: DetailedPokemon
) {
  let yourHP = yourPokemon.maxHP;
  let opponentHP = opponentPokemon.maxHP;

  while (yourHP > 0 && opponentHP > 0) {
    const yourDamage = Math.max(
      yourPokemon.attack - opponentPokemon.defense,
      0
    );
    opponentHP = Math.max(opponentHP - yourDamage, 0);
    // console.log(opponentHP, yourHP);
    if (opponentHP <= 0 && yourHP <= 0) {
      return null;
    } else if (opponentHP <= 0) {
      return yourPokemon;
    }
    const opponentDamage = Math.max(
      opponentPokemon.attack - yourPokemon.defense,
      0
    );
    yourHP = Math.max(yourHP - opponentDamage, 0);
    if (yourHP <= 0) {
      return opponentPokemon;
    }
  }
}

// # deze handler is enkel om testen
app.get("/getDataAPI", (req, res) => {
  res.type("application/json");
  res.json(pokemons);
});

app.get("/", async (req, res) => {
  res.render("landingPage");
});

app.get("/home", async (req, res) => {
  res.render("home", { pokemons, currentPokemon, playerPokemons });
  // console.log(currentPokemon);
});

app.post("/setCurrentPokemon", (req, res) => {
  const setCurrentPokemonID = Number(req.body.setCurrentPokemonID);
  const selectedPokemon = playerPokemons.find(
    (pokemon) => pokemon.id === setCurrentPokemonID
  );
  if (selectedPokemon) {
    currentPokemon = selectedPokemon;
  }

  res.redirect("/myPokemons");

  // // Haal de verwijzende URL op uit de verzoekheaders
  // const referer = req.headers.referer;

  // // Redirect terug naar de verwijzende URL
  // if (referer) {
  //   res.redirect(referer);
  // } else {
  //   res.status(400).send("Referer header missing");
  // }
});

app.get("/pokedex", async (req, res) => {
  const sortField = req.query.sortField || "name";
  const sortDirection = req.query.sortDirection || "asc";

  let sortedPokemons = [...pokemons];

  sortedPokemons.sort((a, b) => {
    return sortDirection === "asc"
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  res.render("pokedex", {
    pokemons: sortedPokemons,
    sortField,
    sortDirection,
    currentPokemon,
    playerPokemons,
  });
});

app.get("/noaccess", async (req, res) => {
  res.render("noAccess", { pokemons });
});

app.get("/login", async (req, res) => {
  res.render("login", { pokemons });
});

app.get("/signup", async (req, res) => {
  res.render("signup", { pokemons });
});

app.get("/starterPokemon", async (req, res) => {
  res.render("starterPokemon", { pokemons, currentPokemon, playerPokemons });
});

let setPokemonLeftToCompare: DetailedPokemon | undefined;
let setPokemonRightToCompare: DetailedPokemon | undefined;
app.get("/compareSelect", async (req, res) => {
  setPokemonLeftToCompare = undefined;
  setPokemonRightToCompare = undefined;
  res.render("compareSelect", {
    pokemons,
    currentPokemon,
    playerPokemons,
    PokemonLeftToCompare: setPokemonLeftToCompare,
    PokemonRightToCompare: setPokemonRightToCompare,
    message: false,
    compareResult: false,
  });
});

app.post("/setPokemonLeftToCompare", async (req, res) => {
  const setPokemonLeftToCompareId = Number(req.body.setPokemonLeftToCompare);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setPokemonLeftToCompareId
  );

  if (selectedPokemon) {
    setPokemonLeftToCompare = selectedPokemon;
    res.render("compareSelect", {
      pokemons,
      currentPokemon,
      playerPokemons,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: false,
      compareResult: false,
    });
  } else {
    res.redirect("/home");
  }
});

app.post("/setPokemonRightToCompare", async (req, res) => {
  const setPokemonRightToCompareId = Number(req.body.setPokemonRightToCompare);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setPokemonRightToCompareId
  );
  if (selectedPokemon) {
    setPokemonRightToCompare = selectedPokemon;
    res.render("compareSelect", {
      pokemons,
      currentPokemon,
      playerPokemons,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: false,
      compareResult: false,
    });
  } else {
    res.redirect("/home");
  }
});

app.post("/startCompare", async (req, res) => {
  if (setPokemonLeftToCompare && setPokemonRightToCompare) {
    res.render("compareSelect", {
      pokemons,
      currentPokemon,
      playerPokemons,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: false,
      compareResult: true,
    });
  } else {
    res.render("compareSelect", {
      pokemons,
      currentPokemon,
      playerPokemons,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: "Je moet zowel je Pokémon als de tegenstander opgeven.",
      compareResult: false,
    });
  }
});

app.get("/mypokemons", async (req, res) => {
  res.render("myPokemons", { playerPokemons, pokemons, currentPokemon });
});

app.get("/pokemon/info/:pokeId", async (req, res) => {
  const pokemonId = parseInt(req.params.pokeId);
  const pokemonFind = pokemons.find(({ id }) => pokemonId === id);
  res.render("pokemoninfo", {
    pokemonFind,
    pokemons,
    message: false,
    currentPokemon,
    playerPokemons,
  });
});

app.get("/catchPokemon", async (req, res) => {
  res.render("catchPokemon", {
    pokemons,
    currentPokemon,
    playerPokemons,
    pokemonToCatch: undefined,
    message: false,
    pokemonCaught: false,
  });
});

app.post("/setPokemonToCatch", async (req, res) => {
  const setPokemonToCatch = Number(req.body.setPokemonToCatch);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setPokemonToCatch
  );
  if (selectedPokemon) {
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      pokemonToCatch: selectedPokemon,
      message: false,
      pokemonCaught: false,
    });
  }
});

app.post("/setRandomPokemonToCatch", async (req, res) => {
  const random = randomIntFromInterval(1, 153);
  const selectedPokemon = pokemons.find((pokemon) => pokemon.id === random);
  // console.log(random, selectedPokemon);
  if (selectedPokemon) {
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      pokemonToCatch: selectedPokemon,
      message: false,
      pokemonCaught: false,
    });
  }
});

let attemptsLeft = 3;
app.post("/catch", async (req, res) => {
  const targetPokemon = pokemons.find(
    (x) => x.id == req.body.targetPokemon
  ) as DetailedPokemon;
  // console.log(targetPokemon);
  if (!currentPokemon) {
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      pokemonToCatch: targetPokemon,
      message: "Selecteer je huidige Pokémon om te starten",
      pokemonCaught: false,
    });
  } else if (
    playerPokemons.find((pokemon) => pokemon.id === targetPokemon.id)
  ) {
    playerPokemons = playerPokemons.filter(
      (pokemon) => pokemon.id !== targetPokemon.id
    );
    if (currentPokemon == targetPokemon) {
      currentPokemon = undefined;
    }
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      pokemonToCatch: targetPokemon,
      message: false,
      pokemonCaught: false,
    });
  } else {
    // const catchChance = 100 - targetPokemon.defense + currentPokemon.attack;
    // const isCaught = Math.random() * 100 < catchChance;
    if (catchPokemon(targetPokemon, currentPokemon)) {
      attemptsLeft = 3;
      playerPokemons.push(targetPokemon);
      res.render("catchPokemon", {
        pokemons,
        currentPokemon,
        playerPokemons,
        pokemonToCatch: targetPokemon,
        message: false,
        pokemonCaught: true,
      });
    } else {
      attemptsLeft--;
      if (attemptsLeft === 0) {
        res.render("catchPokemon", {
          pokemons,
          currentPokemon,
          playerPokemons,
          pokemonToCatch: targetPokemon,
          message: `Je hebt alle pogingen gebruikt. Probeer het opnieuw.`,
          pokemonCaught: false,
        });
      } else {
        res.render("catchPokemon", {
          pokemons,
          currentPokemon,
          playerPokemons,
          pokemonToCatch: targetPokemon,
          message: `Je hebt ${targetPokemon.name} niet kunnen vangen. Je hebt nog ${attemptsLeft} pogingen over.`,
          pokemonCaught: false,
        });
      }
    }
  }
});

app.post("/pokemonNickname", async (req, res) => {
  const setpokemonNickname = Number(req.body.pokemonNicknameID);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setpokemonNickname
  );
  const nicknamePokemon: string = req.body.pokemonNickname;

  if (selectedPokemon && nicknamePokemon) {
    let playerPokemon = playerPokemons.find(
      (pokemon) => pokemon.name === selectedPokemon.name
    );
    if (playerPokemon) {
      playerPokemon.nickname = nicknamePokemon;
    }
    res.redirect("/myPokemons");
  } else {
    res.redirect("/home");
    // console.log(setpokemonNickname, nicknamePokemon);
  }
});

let setPokemonToBattle: DetailedPokemon | undefined;
let setMyPokemonToBattle: DetailedPokemon | undefined;
app.get("/pokeBattler", async (req, res) => {
  setPokemonToBattle = undefined;
  setMyPokemonToBattle = undefined;
  res.render("pokeBattler", {
    pokemons,
    currentPokemon,
    playerPokemons,
    myPokemonToBattle: undefined,
    pokemonToBattle: undefined,
    message: false,
    battleResult: false,
  });
});

app.post("/setPokemonToBattle", async (req, res) => {
  const setPokemonToBattleId = Number(req.body.setPokemonToBattle);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setPokemonToBattleId
  );

  if (selectedPokemon) {
    setPokemonToBattle = selectedPokemon;
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons,
      myPokemonToBattle: setMyPokemonToBattle,
      pokemonToBattle: setPokemonToBattle,
      message: false,
      battleResult: false,
    });
  } else {
    res.redirect("/home");
  }
});

app.post("/setMyPokemonToBattle", async (req, res) => {
  const setMyPokemonToBattleId = Number(req.body.setMyPokemonToBattle);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setMyPokemonToBattleId
  );
  if (selectedPokemon) {
    setMyPokemonToBattle = selectedPokemon;
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons,
      myPokemonToBattle: setMyPokemonToBattle,
      pokemonToBattle: setPokemonToBattle,
      message: false,
      battleResult: false,
    });
  } else {
    res.redirect("/home");
  }
});

app.post("/battle", async (req, res) => {
  if (setPokemonToBattle && setMyPokemonToBattle) {
    // console.log(setPokemonToBattle.name, setMyPokemonToBattle.name);
    const winner = battlePokemon(setMyPokemonToBattle, setPokemonToBattle);
    // console.log(winner);
    if (winner == setMyPokemonToBattle) {
      playerPokemons.push(setPokemonToBattle);
    }
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons,
      myPokemonToBattle: setMyPokemonToBattle,
      pokemonToBattle: setPokemonToBattle,
      message: false,
      battleResult: winner,
    });
  } else {
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons,
      myPokemonToBattle: setMyPokemonToBattle,
      pokemonToBattle: setPokemonToBattle,
      message: "Je moet zowel je Pokémon als de tegenstander opgeven.",
      battleResult: false,
    });
  }
});

app.post("/battleAddPokemon", async (req, res) => {
  const nicknamePokemon: string = req.body.pokemonNickname;
  if (nicknamePokemon) {
    const selectedPokemon = pokemons.find(
      (pokemon) => pokemon.id === setPokemonToBattle?.id
    );
    if (selectedPokemon) {
      selectedPokemon.nickname = nicknamePokemon;
      res.redirect("/myPokemons");
    }
  } else {
    res.redirect("/myPokemons");
  }
});

let randomPokemon: DetailedPokemon;
app.get("/guessPokemon", async (req, res) => {
  randomPokemon = pokemons[randomIntFromInterval(1, 153)];
  res.render("guessPokemon", {
    pokemons,
    randomPokemon,
    currentPokemon,
    playerPokemons,
    message: false,
    guessResult: false,
  });
  console.log(randomPokemon);
});

app.post("/guessPokemonResult", async (req, res) => {
  if (!currentPokemon) {
    res.render("guessPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      randomPokemon,
      message: "Selecteer je huidige Pokémon om te starten",
      guessResult: false,
    });
  } else {
    const guessedPokemonName: string = req.body.myCountry.toLowerCase();
    if (guessedPokemonName === randomPokemon.name) {
      res.render("guessPokemon", {
        pokemons,
        currentPokemon,
        playerPokemons,
        randomPokemon,
        message: false,
        guessResult: randomPokemon,
      });
    } else {
      // console.log(guessedPokemonName);
      res.render("guessPokemon", {
        pokemons,
        currentPokemon,
        playerPokemons,
        randomPokemon,
        message: false,
        guessResult: true,
      });
    }
  }
});

app.post("/improvePokemon", async (req, res) => {
  const getTypeOfImprove: string = req.body.typeOfImprove.toLowerCase();
  // console.log(getTypeOfImprove);
  const selectedPokemon = playerPokemons.find(
    (pokemon) => pokemon.id === currentPokemon?.id
  );
  if (selectedPokemon && getTypeOfImprove === "defense") {
    selectedPokemon.defense += 1;
    // console.log(selectedPokemon.defense);
    // console.log(currentPokemon?.defense);
    // console.log(pokemons[1].defense);
    res.redirect("/myPokemons");
  }
  if (selectedPokemon && getTypeOfImprove === "attack") {
    selectedPokemon.attack += 1;
    // console.log(selectedPokemon.defense);
    // console.log(currentPokemon?.defense);
    // console.log(pokemons[1].defense);
    res.redirect("/myPokemons");
  }
});

app.listen(app.get("port"), async () => {
  const apiResult = await (
    await fetch("https://pokeapi.co/api/v2/pokemon?limit=153")
  ).json();
  const promisePerPokemon: Promise<Response>[] = (
    apiResult.results as NonDetailedPokemon[]
  ).map(({ url }) => fetch(url));
  const jsons = (await Promise.all(promisePerPokemon)).map((response) =>
    response.json()
  );
  pokemons = (await Promise.all(jsons)).map((singlePokemon) => {
    return {
      id: singlePokemon.id,
      name: singlePokemon.name,
      types: singlePokemon.types.map(
        (slotAndType: any) => slotAndType.type.name
      ),
      image: singlePokemon.sprites.front_default,
      height: singlePokemon.height,
      weight: singlePokemon.weight,
      maxHP: singlePokemon.stats[0].base_stat,
      attack: singlePokemon.stats[1].base_stat,
      defense: singlePokemon.stats[2].base_stat,
      special_attack: singlePokemon.stats[3].base_stat,
      special_defense: singlePokemon.stats[4].base_stat,
      speed: singlePokemon.stats[5].base_stat,
      nickname: "",
    };
  });
  playerPokemons = [
    pokemons[0],
    pokemons[1],
    pokemons[2],
    pokemons[3],
    pokemons[4],
    pokemons[5],
    pokemons[6],
    pokemons[7],
    pokemons[8],
  ];
  randomPokemon = pokemons[randomIntFromInterval(1, 153)];
  console.log("[server] http://localhost:" + app.get("port"));
});

app.use((req, res) => {
  res.status(404);
  res.render("404", { pokemons, currentPokemon, playerPokemons });
});
