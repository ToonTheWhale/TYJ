import dotenv from "dotenv";
dotenv.config();
import express, { Express } from "express";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import path, { format } from "path";
import {
  addStarterPokemon,
  connect,
  pullPokemon,
  pokemonCollection,
  userCollection,
  pushPokemon,
  addPokemonNickname,
  updatePokemon,
  updateCurrentPokemon,
} from "./database";
import { login, signup } from "./database";
import session from "./session";
import { User, NonDetailedPokemon, DetailedPokemon } from "./types";
import { secureMiddleware } from "./secureMiddleware";
import { loginRouter } from "./routes/loginRouter";
import { homeRouter } from "./routes/homeRouter";
import { flashMiddleware } from "./flashMiddleware";
import { read } from "fs";

const app: Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(session);
app.set("views", path.join(__dirname, "views"));
app.set("port", process.env.PORT || 3000);

app.use(loginRouter());
app.use(homeRouter());
app.use(flashMiddleware);

// Mongodb
const mongodbUsername = "Yazan";
const mongodbPassword = "Yazanmax1";
const mongodbDatabase = "cluster0";
const uri = `mongodb+srv://${mongodbUsername}:${mongodbPassword}@${mongodbDatabase}.oaon2vd.mongodb.net/WebOntwikkeling?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

export let pokemons: DetailedPokemon[] = [];
export let users: User[] = [];
export let playerPokemons: DetailedPokemon[] = [];
export let currentPokemon: DetailedPokemon | undefined;
export let loggedInUser: User;

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

async function fetchEvolutionChain(pokemonSpeciesUrl: any) {
  try {
    const speciesResponse = await fetch(pokemonSpeciesUrl);
    const speciesData = await speciesResponse.json();
    const evolutionChainUrl = speciesData.evolution_chain.url;
    const evolutionChainResponse = await fetch(evolutionChainUrl);
    const evolutionChainData = await evolutionChainResponse.json();
    const evolutionChain = parseEvolutionChain(evolutionChainData);
    return evolutionChain;
  } catch (error) {
    console.error("Error fetching evolution chain: ", error);
  }
}
function parseEvolutionChain(evolutionChainData: any) {
  const chain = evolutionChainData.chain;
  let evolutionChain: any = [];

  // parse evolution chain
  function parseChain(chain: any) {
    const evolutionDetails =
      chain.evolution_details.length > 0 ? chain.evolution_details[0] : null;
    const evolvesTo = chain.evolves_to;

    const evolution = {
      species: {
        name: chain.species.name,
        url: chain.species.url,
      },
      evolution_details: evolutionDetails,
    };
    evolutionChain.push(evolution);

    if (evolvesTo.length > 0) {
      for (const nextEvolution of evolvesTo) {
        parseChain(nextEvolution);
      }
    }
  }

  parseChain(chain);
  return evolutionChain;
}

async function populateEvolutionChains(pokemons: any) {
  try {
    for (const pokemon of pokemons) {
      const evolutionChain = await fetchEvolutionChain(pokemon.species.url);
      pokemon.evolutionChain = evolutionChain;
      await pokemonCollection.updateOne(
        { _id: pokemon._id },
        { $set: { evolutionChain: evolutionChain } }
      );
    }
    console.log("Evolution chains updated successfully in MongoDB.");
  } catch (error) {
    console.error("Error updating evolution chains in MongoDB:", error);
  }
}

// # deze handler is enkel om testen
app.get("/getDataAPI", (req, res) => {
  res.type("application/json");
  res.json(pokemons);
});

// app.get("/",async (req, res) => {
//   res.render("landingPage");
// });

app.get("/home", secureMiddleware, async (req, res) => {
  if (req.session.user) {
    playerPokemons = req.session.user.team;
    currentPokemon = req.session.user.team.find(
      (pokemon) => pokemon.id === req.session.user?.currentPokemon
    );
    res.render("home", { pokemons, currentPokemon, playerPokemons });
  } else {
    res.redirect("/");
  }
  // console.log(currentPokemon);
});

app.post("/setCurrentPokemon", secureMiddleware, (req, res) => {
  const setCurrentPokemonID = Number(req.body.setCurrentPokemonID);
  const selectedPokemon = playerPokemons.find(
    (pokemon) => pokemon.id === setCurrentPokemonID
  );
  if (selectedPokemon && req.session.user) {
    currentPokemon = selectedPokemon;
    updateCurrentPokemon(req.session.user, selectedPokemon.id);
    req.session.user.currentPokemon = selectedPokemon.id;
    console.log(req.session.currentPokemon);
  }
  req.session.save(() => res.redirect("/myPokemons"));

  // Haal de verwijzende URL op uit de verzoekheaders
  // const referer = req.headers.referer;

  // Redirect terug naar de verwijzende URL
  // if (referer) {
  //   req.session.save(() =>res.redirect(referer));
  // } else {
  //   res.status(400).send("Referer header missing");
  // }
});

app.get("/pokedex", secureMiddleware, async (req, res) => {
  const sortField = req.query.sortField || "name";
  const sortDirection = req.query.sortDirection || "asc";

  let sortedPokemons = [...pokemons];

  sortedPokemons.sort((a, b) => {
    if (sortField == "name") {
      return sortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortField == "id") {
      return sortDirection === "asc" ? a.id - b.id : b.id - a.id;
    } else {
      return 0;
    }
  });

  res.render("pokedex", {
    pokemons: sortedPokemons,
    sortField,
    sortDirection,
    currentPokemon,
    playerPokemons: req.session.user?.team,
  });
});

app.get("/noaccess", secureMiddleware, async (req, res) => {
  res.render("noAccess", { pokemons });
});

app.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// app.get("/login",async (req, res) => {
//   if (req.session.user) {
//     res.redirect("/home");
//   } else {
//     res.render("login", { pokemons, message: false });
//   }
// });

// app.post("/login", async (req, res) => {
//   const username: string = req.body.username;
//   const password: string = req.body.password;
//   console.log(username, password);
//   try {
//     let user: User = await login(username, password);
//     delete user.password;
//     req.session.user = user;
//     playerPokemons = user.team;
//     res.redirect("/home");
//   } catch (e: any) {
//     // console.log(e);
//     res.render("login", { pokemons, message: e });
//   }
// });

app.get("/signup", async (req, res) => {
  res.render("signup", { pokemons, message: false });
});

app.post("/createPlayer", async (req, res) => {
  const { username, email, password } = req.body;
  console.log(username, email, password);
  try {
    let user: User = await signup(username, email, password);
    delete user.password;
    req.session.user = user;
    playerPokemons = user.team;
    currentPokemon = undefined;
    res.redirect("/starterPokemon");
  } catch (e: any) {
    res.render("signup", { pokemons, message: e });
  }
});

app.get("/starterPokemon", secureMiddleware, async (req, res) => {
  res.render("starterPokemon", {
    pokemons,
    currentPokemon,
    playerPokemons: req.session.user?.team,
  });
});

app.get("/addStarterPokemon/:pokeId", secureMiddleware, async (req, res) => {
  let pokemonId = parseInt(req.params.pokeId);
  if (req.session.user && req.session.user.team.length === 0) {
    let starterPokemon = await addStarterPokemon(pokemonId, req.session.user);
    req.session.user.team.push(starterPokemon);
    res.redirect("/home");
  } else {
    res.redirect("/");
  }
});

let setPokemonLeftToCompare: DetailedPokemon | undefined;
let setPokemonRightToCompare: DetailedPokemon | undefined;
app.get("/compareSelect", secureMiddleware, async (req, res) => {
  setPokemonLeftToCompare = undefined;
  setPokemonRightToCompare = undefined;
  res.render("compareSelect", {
    pokemons,
    currentPokemon,
    playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: false,
      compareResult: true,
    });
  } else {
    res.render("compareSelect", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
      PokemonLeftToCompare: setPokemonLeftToCompare,
      PokemonRightToCompare: setPokemonRightToCompare,
      message: "Je moet zowel je Pokémon als de tegenstander opgeven.",
      compareResult: false,
    });
  }
});

app.get("/mypokemons", secureMiddleware, async (req, res) => {
  res.render("myPokemons", {
    playerPokemons: req.session.user?.team,
    pokemons,
    currentPokemon,
  });
});

app.get("/pokemon/info/:pokeId", secureMiddleware, async (req, res) => {
  const pokemonId = parseInt(req.params.pokeId);
  const pokemonFind = pokemons.find(({ id }) => pokemonId === id);
  res.render("pokemoninfo", {
    pokemonFind,
    pokemons,
    message: false,
    currentPokemon,
    playerPokemons: req.session.user?.team,
  });
});

app.get("/catchPokemon", secureMiddleware, async (req, res) => {
  res.render("catchPokemon", {
    pokemons,
    currentPokemon,
    playerPokemons: req.session.user?.team,
    pokemonToCatch: undefined,
    message: false,
    pokemonCaught: false,
  });
});

app.post("/setPokemonToCatch", secureMiddleware, async (req, res) => {
  const setPokemonToCatch = Number(req.body.setPokemonToCatch);
  const selectedPokemon = pokemons.find(
    (pokemon) => pokemon.id === setPokemonToCatch
  );
  if (selectedPokemon) {
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
      pokemonToCatch: selectedPokemon,
      message: false,
      pokemonCaught: false,
    });
  }
});

app.post("/setRandomPokemonToCatch", secureMiddleware, async (req, res) => {
  const random = randomIntFromInterval(1, 153);
  const selectedPokemon = pokemons.find((pokemon) => pokemon.id === random);
  // console.log(random, selectedPokemon);
  if (selectedPokemon) {
    res.render("catchPokemon", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
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
      if (req.session.user) {
        pushPokemon(targetPokemon, req.session.user);
        req.session.user.team.push(targetPokemon);
        req.session.save(() =>
          res.render("catchPokemon", {
            pokemons,
            currentPokemon,
            playerPokemons: req.session.user?.team,
            pokemonToCatch: targetPokemon,
            message: false,
            pokemonCaught: true,
          })
        );
      }
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

  if (selectedPokemon && nicknamePokemon && req.session.user) {
    let playerPokemon = req.session.user.team.find(
      (pokemon) => pokemon.name === selectedPokemon.name
    );
    if (playerPokemon) {
      playerPokemon.nickname = nicknamePokemon;
      addPokemonNickname(selectedPokemon, req.session.user, nicknamePokemon);
    }
    res.redirect("/myPokemons");
  } else {
    res.redirect("/home");
    // console.log(setpokemonNickname, nicknamePokemon);
  }
});

let setPokemonToBattle: DetailedPokemon | undefined;
let setMyPokemonToBattle: DetailedPokemon | undefined;
app.get("/pokeBattler", secureMiddleware, async (req, res) => {
  setPokemonToBattle = undefined;
  setMyPokemonToBattle = undefined;
  res.render("pokeBattler", {
    pokemons,
    currentPokemon,
    playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
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
  const selectedPokemon = playerPokemons.find(
    (pokemon) => pokemon.id === setMyPokemonToBattleId
  );
  if (selectedPokemon) {
    setMyPokemonToBattle = selectedPokemon;
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
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
    if (winner == setMyPokemonToBattle && req.session.user) {
      pushPokemon(setPokemonToBattle, req.session.user);
      req.session.user?.team.push(setPokemonToBattle);
    }
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
      myPokemonToBattle: setMyPokemonToBattle,
      pokemonToBattle: setPokemonToBattle,
      message: false,
      battleResult: winner,
    });
  } else {
    res.render("pokeBattler", {
      pokemons,
      currentPokemon,
      playerPokemons: req.session.user?.team,
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
    const selectedPokemon = req.session.user?.team.find(
      (pokemon) => pokemon.id === setPokemonToBattle?.id
    );
    if (selectedPokemon && req.session.user) {
      selectedPokemon.nickname = nicknamePokemon;
      addPokemonNickname(selectedPokemon, req.session.user, nicknamePokemon);
      res.redirect("/myPokemons");
    }
  } else {
    res.redirect("/myPokemons");
  }
});

let randomPokemon: DetailedPokemon;
app.get("/guessPokemon", secureMiddleware, async (req, res) => {
  randomPokemon = pokemons[randomIntFromInterval(1, 100)];
  res.render("guessPokemon", {
    pokemons,
    randomPokemon,
    currentPokemon,
    playerPokemons: req.session.user?.team,
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
      playerPokemons: req.session.user?.team,
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
  const selectedPokemon = req.session.user?.team.find(
    (pokemon) => pokemon.id === currentPokemon?.id
  );
  console.log(selectedPokemon);
  if (selectedPokemon && getTypeOfImprove === "defense" && req.session.user) {
    selectedPokemon.defense += 1;
    playerPokemons = req.session.user.team;
    updatePokemon(req.session.user);
    req.session.save(() => res.redirect("/myPokemons"));

    // console.log(selectedPokemon.defense);
    // console.log(currentPokemon?.defense);
    // console.log(pokemons[1].defense);
  }
  if (selectedPokemon && getTypeOfImprove === "attack" && req.session.user) {
    selectedPokemon.attack += 1;
    updatePokemon(req.session.user);
    req.session.save(() => res.redirect("/myPokemons"));

    // console.log(selectedPokemon.attack);
    // console.log(currentPokemon?.attack);
    // console.log(pokemons[1].attack);
  }
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    if ((await pokemonCollection.countDocuments()) > 0) {
      pokemons = await pokemonCollection.find<DetailedPokemon>({}).toArray();
    } else {
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
          species: singlePokemon.species,
          evolutionChain: singlePokemon.evolutionChain,
        };
      });

      await pokemonCollection.insertMany(pokemons);
    }
    if ((await userCollection.countDocuments()) > 0) {
      users = await userCollection.find<User>({}).toArray();
    }
    // playerPokemons = [
    //   pokemons[0],
    //   pokemons[1],
    //   pokemons[2],
    //   pokemons[3],
    //   pokemons[4],
    //   pokemons[5],
    //   pokemons[6],
    //   pokemons[7],
    //   pokemons[8],
    // ];
    randomPokemon = pokemons[randomIntFromInterval(1, 100)];
    // console.log("Connected to database");
  } catch (error) {
    console.error(error);
  } finally {
    await client.close();
  }
  console.log("[server] http://localhost:" + app.get("port"));
});

app.use((req, res) => {
  res.status(404);
  res.render("404", {
    pokemons,
    currentPokemon,
    playerPokemons: req.session.user?.team,
  });
});
