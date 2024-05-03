import { error } from "console";
import express from "express";
import session from "express-session";
import { exit } from "process";
import { SessionData } from "express-session";

const app = express();
app.use(
  session({
    secret: "tyj",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("port", 3000);
import { Collection, MongoClient, MongoDBCollectionNamespace } from "mongodb";
import { ObjectId } from "mongodb";
const uri =
  "mongodb+srv://gilles5ecmt:B4YSEjAIAX3w8rAm@cluster0.q9yuckb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);

//functie verbinding met MongoDB database maken
const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log("Connected to database");
  } catch (e) {
    console.log(`An error has occurred: ${e}`);
  }
};

connectToDatabase();

let pokemonCollection = client.db("WPL").collection("Pokemon");
let usersCollection = client.db("WPL").collection<User>("Users");

const userSchema = {
  _id: ObjectId,
  username: { type: "string", required: true, unique: true },
  email: { type: "string", required: true, unique: true },
  password: { type: "string", required: true },
  team: { type: "number[]", ref: "PokemonTeam" },
};

var MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: `mongodb+srv://gilles5ecmt:B4YSEjAIAX3w8rAm@cluster0.q9yuckb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
  collection: "sessions",
});

interface UserSessionData extends SessionData {
  userId?: ObjectId; // Declare the userId property as optional
}

/* test user
  const testUser = async () => {
    try {
      const newUser = {
        _id: new ObjectId,
        username: "gebruiker",
        email: "gebruiker@mail.com",
        password: "paswoord"
      };

      await usersCollection.insertOne(newUser);
      console.log("User document inserted successfully");
    } catch (e) {
      console.error("Error bij het toevoegen van de gebruiker", error);s
    }
  };
  /*/
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

interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  team: number[];
}

let users: User[];
let loggedInUser: User;
let pokemons: DetailedPokemon[] = [];
let playerPokemons: DetailedPokemon[] = [];

declare module "express-session" {
  export interface SessionData {
    user: User;
  }
}

const insertPokemonData = async () => {
  try {
    // checken of er al pokemon in de mongoDB collection zitten
    const existingPokemonCount = await pokemonCollection.countDocuments();

    if (existingPokemonCount === 0) {
      // als het leeg is, pokemon toevoegen
      await pokemonCollection.insertMany(pokemons);
      console.log("Pokemon data inserted into MongoDB");
    } else {
      // als er pokemon in zitten, toevoeging skippen
      console.log(
        "Pokemon data already exists in MongoDB. Skipping insertion."
      );
    }
  } catch (error) {
    console.log("Error inserting pokemon into database", error);
  }
};

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
  res.render("landingPage", { pokemons });
});

app.get("/home", async (req, res) => {
  res.render("home", { pokemons });
});

app.get("/pokedex", async (req, res) => {
  const sortedPokemons = pokemons.sort((a, b) => a.id - b.id); // Sort by ID
  res.render("pokedex", { pokemons: sortedPokemons });
});

app.get("/noaccess", async (req, res) => {
  res.render("noAccess", { pokemons });
});

app.get("/login", async (req, res) => {
  res.render("login", { pokemons });
});

app.post("/login", async (req, res) => {
  const login_username = req.body.username;
  const login_password = req.body.password;

  const users = await usersCollection.find().toArray();
  const user = users.find(({ username }) => login_username === username);
  if (user) {
    if (user.password === login_password) {
      req.session.user = user;
      loggedInUser = req.session.user;
      req.session.save(() => {
        res.redirect("/home");
      });
      const userTeam = user.team;
      playerPokemons = pokemons.filter((pokemon) =>
        userTeam.includes(pokemon.id)
      );
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/signup", async (req, res) => {
  res.render("signup", { pokemons });
});
app.post("/signup", async (req, res) => {
  try {
    const userId = new ObjectId();
    const { username, email, password, startingPokemonId } = req.body;
    await usersCollection.insertOne({
      _id: userId,
      username,
      email,
      password,
      team: [],
    });
    res.redirect("/starterPokemon");
  } catch (error) {
    console.error("Error registering user: ", error);
  }
});

app.get("/starterPokemon", async (req, res) => {
  res.render("starterPokemon", { pokemons });
});

app.get("/addStarterPokemon/:pokeId", async (req, res) => {
  // PROBLEEM: USER NOT FOUND altijd, checken hoe met cookies en sessions werken
  const { username } = req.query;
  const pokemonId = parseInt(req.params.pokeId);
  const user = await usersCollection.findOne({ username: username });
  if (!user) {
    return res.status(404).send("User not found");
  }
  user.team.push(pokemonId);
  await usersCollection.updateOne(
    { username: username },
    { $push: { team: pokemonId } }
  );
  res.redirect("/home"); // Redirect the user to the home page after adding the starter Pokemon
});

app.get("/vergelijken", async (req, res) => {
  res.render("vergelijken", { pokemons });
});

app.get("/vechten", async (req, res) => {
  res.render("vechten", { pokemons });
});

app.get("/mypokemons", async (req, res) => {
  if (!loggedInUser) {
    return res.redirect("/login");
  }
  const userTeam = loggedInUser.team;
  const userPokemons = pokemons.filter((pokemon) =>
    userTeam.includes(pokemon.id)
  );

  res.render("myPokemons", { pokemons: userPokemons });
});

app.get("/pokemon/info/:pokeId", async (req, res) => {
  const pokemonId = parseInt(req.params.pokeId);
  const pokemonFind = pokemons.find(({ id }) => pokemonId === id);
  res.render("pokemoninfo", { pokemonFind, pokemons, message: false });
});

app.get("/catchPokemon", async (req, res) => {
  res.render("catchPokemon", { pokemons });
});

app.post("/catch", async (req, res) => {
  const targetPokemon = pokemons.find(
    (x) => x.id == req.body.pokemon
  ) as DetailedPokemon;
  console.log(targetPokemon);
  // # wordt later gewijzigd
  const currentPokemon = { attack: 10 } as DetailedPokemon;
  let caught = false;
  for (let i = 0; i < 3; i++) {
    caught = catchPokemon(targetPokemon, currentPokemon);

    if (caught && !playerPokemons.includes(targetPokemon)) {
      playerPokemons.push(targetPokemon);
      break;
    } else if (caught) {
      break;
    }
  }
  if (caught) {
    res.render("myPokemons", { playerPokemons, pokemons });
  } else {
    res.render("pokemoninfo", {
      pokemonFind: targetPokemon,
      playerPokemons,
      message: true,
      pokemons,
    });
  }
});

app.get("/guessPokemon", async (req, res) => {
  let randomNumber = randomIntFromInterval(1, 153);
  res.render("guessPokemon", { pokemons, randomNumber });
});

app.listen(app.get("port"), async () => {
  insertPokemonData();
  //testUser();
  try {
    // pokemon data van MongoDB halen
    const pokemonData = await pokemonCollection.find({}).toArray();

    // Array vullen met MongoDB data
    pokemons = pokemonData.map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      image: pokemon.image,
      height: pokemon.height,
      weight: pokemon.weight,
      maxHP: pokemon.maxHP,
      defense: pokemon.defense,
      attack: pokemon.attack,
    }));

    console.log("[server] http://localhost:" + app.get("port"));
  } catch (error) {
    console.error("Error fetching Pokémon data from MongoDB:", error);
    process.exit(1); // Exit the process if there's an error
  }
});

app.use((req, res) => {
  res.status(404);
  res.render("404", { pokemons });
});
