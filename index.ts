import express from "express";

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
let currentPokemon: DetailedPokemon;

function randomIntFromInterval(min: number, max: number) {
  //functie voor een random getal met 2 parameters
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function catchPokemon( //functie om een pokemon te vangen
  targetPokemon: DetailedPokemon,
  currentPokemon: DetailedPokemon
): boolean {
  const catchPercentage = 100 - targetPokemon.defense + currentPokemon.attack;
  let caught = false;
  const random = randomIntFromInterval(1, 100);
  console.log(random, catchPercentage)
  if (random <= catchPercentage) {
    caught = true;
  }

  return caught;

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
  const selectedPokemon = pokemons.find(
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

app.get("/compareSelect", async (req, res) => {
  res.render("compareSelect", { pokemons, currentPokemon, playerPokemons });
});

app.get("/pokeBattler", async (req, res) => {
  res.render("pokeBattler", { pokemons, currentPokemon, playerPokemons });
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
    pokemonCaught:false
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
      pokemonCaught:false
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
      pokemonCaught:false
    });
  } else if (
    playerPokemons.find((pokemon) => pokemon.id === targetPokemon.id)
  ) {
    playerPokemons = playerPokemons.filter(
      (pokemon) => pokemon.id !== targetPokemon.id
    );
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons,
      pokemonToCatch: targetPokemon,
      message: false,
      pokemonCaught:false
    });
  } else {
    // const catchChance = 100 - targetPokemon.defense + currentPokemon.attack;
    // const isCaught = Math.random() * 100 < catchChance;
    if (catchPokemon(targetPokemon,currentPokemon)) {
      attemptsLeft = 3;
      playerPokemons.push(targetPokemon);
      res.render("catchPokemon", {
        pokemons,
        currentPokemon,
        playerPokemons,
        pokemonToCatch: targetPokemon,
        message: false,
        pokemonCaught:true
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
          pokemonCaught:false
        });
      } else {
        res.render("catchPokemon", {
          pokemons,
          currentPokemon,
          playerPokemons,
          pokemonToCatch: targetPokemon,
          message: `Je hebt ${targetPokemon.name} niet kunnen vangen. Je hebt nog ${attemptsLeft} pogingen over.`,
          pokemonCaught:false
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
    let playerPokemon  =  playerPokemons.find(pokemon => pokemon.name === selectedPokemon.name)
    if (playerPokemon) {
      playerPokemon.nickname = nicknamePokemon
    }
    res.redirect("/myPokemons")
  }else {
    res.redirect("/home")
    console.log(setpokemonNickname, nicknamePokemon)
  }
});

app.get("/guessPokemon", async (req, res) => {
  let randomNumber = randomIntFromInterval(1, 153);
  res.render("guessPokemon", {
    pokemons,
    randomNumber,
    currentPokemon,
    playerPokemons,
  });
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
      defense: singlePokemon.stats[2].base_stat,
      attack: singlePokemon.stats[1].base_stat,
      nickname: ""
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
  console.log("[server] http://localhost:" + app.get("port"));
});

app.use((req, res) => {
  res.status(404);
  res.render("404", { pokemons, currentPokemon, playerPokemons });
});
