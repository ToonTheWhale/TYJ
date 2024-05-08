import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { DetailedPokemon, User } from "./types";
import bcrypt from "bcrypt";
import { loggedInUser, pokemons, users } from "./index";
import { DetailedPeerCertificate } from "tls";

// Mongodb
const mongodbUsername = "Yazan";
const mongodbPassword = "Yazanmax1";
const mongodbDatabase = "cluster0";
const uri = `mongodb+srv://${mongodbUsername}:${mongodbPassword}@${mongodbDatabase}.oaon2vd.mongodb.net/WebOntwikkeling?retryWrites=true&w=majority`;

export const MONGODB_URI = uri ?? "mongodb://localhost:27017";
export const client = new MongoClient(MONGODB_URI);
export const userCollection = client
  .db("login-express")
  .collection<User>("users");
export const pokemonCollection = client
  .db("WPL")
  .collection<DetailedPokemon>("Pokemons");
async function exit() {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
}

export async function connect() {
  await client.connect();
  await createInitialUser();
  console.log("Connected to database");
  process.on("SIGINT", exit);
}

const saltRounds: number = 10;
async function createInitialUser() {
  if ((await userCollection.countDocuments()) > 0) {
    return;
  }
  let email: string | undefined = process.env.ADMIN_EMAIL;
  let password: string | undefined = process.env.ADMIN_PASSWORD;
  if (email === undefined || password === undefined) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment"
    );
  }
  if (pokemons.length > 0) {
    await userCollection.insertOne({
      id: 0,
      email: email,
      username: email,
      password: await bcrypt.hash(password, saltRounds),
      team: pokemons,
      role: "ADMIN",
      currentPokemon: undefined
    });
  } else {
    function delay(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    delay(5000).then(async () => {
      await userCollection.insertOne({
        id: 0,
        email: email,
        username: email,
        password: await bcrypt.hash(password, saltRounds),
        team: pokemons,
        role: "ADMIN",
        currentPokemon: undefined
      });
    });
  }
}

export async function login(username: string, password: string) {
  if (username === "" || password === "") {
    throw new Error("Email and password required");
  }
  let user: User | null = await userCollection.findOne<User>({
    username: username,
  });
  if (user) {
    if (await bcrypt.compare(password, user.password!)) {
      return user;
    } else {
      throw new Error("Password incorrect");
    }
  } else {
    throw new Error("User not found");
  }
}

export async function signup(
  username: string,
  email: string,
  password: string
) {
  if (username === "" || email === "" || password === "") {
    throw new Error("username, Email and password required");
  }

  // Controleer of de gebruikersnaam/e-mail al bestaat
  const existingEmail = users.find((user) => user.email === email);
  const existingUsername = users.find((user) => user.username === username);
  //   console.log(existingEmail,existingUsername)
  if (existingEmail === undefined && existingUsername === undefined) {
    // Genereer een nieuwe gebruikers-ID
    const newUserId = users.reduce((acc, user) => {
      return Math.max(acc, user.id) + 1;
    }, 1);

    // Maak een nieuw spelerobject
    const newUser: User = {
      id: newUserId,
      username: username,
      email: email,
      password: await bcrypt.hash(password, saltRounds),
      team: [],
      role: "USER",
      currentPokemon: undefined
    };

    // Nieuwe gebruiker toevoegen aan array (local)
    users.push(newUser);

    // Nieuwe gebruiker toevoegen aan mongodb (database)
    await userCollection.insertOne({
      id: newUserId,
      email: email,
      username: email,
      password: await bcrypt.hash(password, saltRounds),
      team: [],
      role: "USER",
      currentPokemon: undefined
    });
    return newUser;
  } else {
    if (existingUsername) {
      throw new Error(
        "Deze gebruikersnaam is al in gebruik. Kies alstublieft een andere gebruikersnaam."
      );
    } else {
      throw new Error(
        "Dit e-mailadres is al gekoppeld aan een ander account. Gebruik alstublieft een ander e-mailadres."
      );
    }
  }
}

export async function addStarterPokemon(pokemonId: number, user: User) {
  if (!pokemonId) {
    throw new Error("pokemonId required");
  }
  let starterPokemon: DetailedPokemon | null =
    await pokemonCollection.findOne<DetailedPokemon>({
      id: pokemonId,
    });
  if (starterPokemon) {
    let updateUserTeam = await userCollection.updateOne(
      { id: user.id },
      { $push: { team: starterPokemon } }
    );
    return starterPokemon;
  } else {
    throw new Error("Pokemon not found");
  }
}

export async function pullPokemon(pokemon: DetailedPokemon, user: User) {
  if (!pokemon) {
    throw new Error("pokemon required");
  }
  let selectedPokemon: DetailedPokemon = pokemon;
  if (selectedPokemon) {
    let updateUserTeam = await userCollection.updateOne(
      { id: user.id },
      { $pull: { team: selectedPokemon } }
    );
  } else {
    throw new Error("Pokemon not found");
  }
}

export async function pushPokemon(pokemon: DetailedPokemon, user: User) {
  if (!pokemon) {
    throw new Error("pokemon required");
  }
  let selectedPokemon: DetailedPokemon = pokemon;
  if (selectedPokemon) {
    let updateUserTeam = await userCollection.updateOne(
      { id: user.id },
      { $push: { team: selectedPokemon } }
    );
  } else {
    throw new Error("Pokemon not found");
  }
}

export async function addPokemonNickname(pokemon: DetailedPokemon, user: User, nickname:string) {
  if (!pokemon) {
    throw new Error("pokemon required");
  }
  let selectedPokemon: DetailedPokemon = pokemon;
  if (selectedPokemon) {
    let updateUserTeam = await userCollection.updateOne(
      { id: user.id },
      { $set: { nickname: nickname } }
    );
  } else {
    throw new Error("Pokemon not found");
  }
}

export async function updatePokemon( user: User) {
  if (!user) {
    throw new Error("user required");
  }
  if (user) {
    let selectedTeamUser: DetailedPokemon[] = user.team
    console.log(selectedTeamUser)
    await userCollection.updateOne(
      { id: user.id },
      { $set: { team: selectedTeamUser } }
    );
  } else {
    throw new Error("Pokemon not found");
  }
}

export async function updateCurrentPokemon( user: User, currentPokemon : number) {
  if (!user) {
    throw new Error("user required");
  }
  if (user) {
    await userCollection.updateOne(
      { id: user.id },
      { $set: { currentPokemon: currentPokemon } }
    );
  } else {
    throw new Error("Pokemon not found");
  }
}