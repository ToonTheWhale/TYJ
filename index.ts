import express from "express";

// alle foto's van pokémon zijn afkomstig van de pokéapi: https://pokeapi.co

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
}

let pokemons: DetailedPokemon[] = [];
let playerPokemons: DetailedPokemon[] = [];

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
  res.render("home", { pokemons });
});

app.get("/noaccess", async (req, res) => {
  res.render("noAccess")
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.get("/signup", async (req, res) => {
  res.render("signup");
});

app.get("/vergelijken", async (req, res) => {
  res.render("vergelijken", { pokemons });
});

app.get("/vechten", async (req, res) => {
  res.render("vechten", { pokemons });
});

app.get("/mypokemons", async (req, res) => {
  playerPokemons = [
    pokemons[1],
    pokemons[2],
    pokemons[3],
    pokemons[4],
    pokemons[5],
    pokemons[6],
    pokemons[7],
    pokemons[8],
  ];
  res.render("myPokemons", { playerPokemons });
});

app.get("/pokemon/info/:pokeId", async (req, res) => {
  const pokemonId = parseInt(req.params.pokeId);
  const pokemonFind = pokemons.find(({ id }) => pokemonId === id);
  res.render("pokemoninfo", { pokemonFind });
});

app.post("/catch", async (req, res) => {
  const targetPokemon = pokemons.find(
    ({ id }) => (id = req.body.pokemon)
  ) as DetailedPokemon;
  const currentPokemon = { attack: 10 } as DetailedPokemon;

  for (let i = 0; i < 3; i++) {
    let caught = catchPokemon(targetPokemon, currentPokemon);

    if (caught) {
      playerPokemons.push(targetPokemon);
      break;
    }
  }

  res.redirect("/");
});

app.listen(app.get("port"), async () => {
  const apiResult = await (
    await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
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
    };
  });
  console.log("[server] http://localhost:" + app.get("port"));
});

app.use((req, res) => {
  res.status(404);
  res.render("404");
});
