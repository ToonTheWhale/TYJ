import express from "express";

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("port", 3000);


interface NonDetailedPokemon {
    name: string,
    url: string,
}

interface DetailedPokemon {
    id: number,
    name: string,
    types: string[],
    image: string,
    height: number,
    weight: number,
    maxHP: number,
}

let pokemons : DetailedPokemon[];

// # deze handler is enkel om testen 
app.get('/getDataAPI',(req,res)=>{
    res.type('application/json');
    res.json(pokemons);
});

app.get('/', async (req,res)=>{
    res.render("home",{pokemons})
});

app.get("/login", async (req, res) => {
    res.render("login");
});

app.get("/signup", async (req, res) => {
    res.render("signup");
});

app.get("/vergelijken", async (req, res) => {
    res.render("vergelijken",{pokemons});
});

app.get("/vechten", async (req, res) => {
    res.render("vechten",{pokemons});
});

app.get("/mypokemons", async (req, res) => {
    let playerPokemons : DetailedPokemon[] = [pokemons[1],pokemons[2],pokemons[3],pokemons[4],pokemons[5],pokemons[6],pokemons[7],pokemons[8]]
    res.render("myPokemons",{playerPokemons});
});

app.get("/pokemon/info/:pokeId", async (req, res) => {
    const pokemonId = parseInt(req.params.pokeId);
    const pokemonFind = pokemons.find(({ id }) => pokemonId === id);
    res.render("pokemoninfo", {pokemonFind})
}); 

app.listen(app.get('port'), async ()=>{
    const apiResult = await (await fetch("https://pokeapi.co/api/v2/pokemon?limit=151")).json();
    const promisePerPokemon: Promise<Response>[] = (apiResult.results as NonDetailedPokemon[]).map(({ url }) => fetch(url));
    const jsons = (await Promise.all(promisePerPokemon)).map((response) => response.json());
    pokemons = (await Promise.all(jsons)).map((singlePokemon) => {
        return {
            id: singlePokemon.id,
            name: singlePokemon.name,
            types: singlePokemon.types.map((slotAndType: any) => slotAndType.type.name),
            image: singlePokemon.sprites.front_default,
            height: singlePokemon.height,
            weight: singlePokemon.weight,
            maxHP: singlePokemon.stats[0].base_stat,
        }
    });
    console.log( '[server] http://localhost:' + app.get('port'));
});