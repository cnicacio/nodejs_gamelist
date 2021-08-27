const express = require("express"); // Must install express module (npm i express). Imports the express module from node_modules
const validURL = require("valid-url"); // Must install valid-url module (npm i valid-url). This will check whether the string inserted in the object image is an URL or not
const validImg = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}; // function to check whether the URL extension refers to an image or not (.jpg, .jpeg, .gif or .png)
const app = express(); // creates the app
const port = 3000; // saves the server's port in a constant

app.use(express.json()); // converts requisitions and responses to JSON

// creates an array of objects, in which each object represents a game
const games = [
  {
    id: 1,
    name: "FIFA 22",
    year: 2021,
    studio: "Eletronic Arts",
    genre: "Sports",
    image:
      "https://deuclick.com.br/wp-content/uploads/2021/07/FIFA-22-deuclick_-reserva.jpeg",
  },
  {
    id: 2,
    name: "eFootball 2022",
    year: 2021,
    studio: "Konami Digital Entertainment",
    genre: "Sports",
    image:
      "https://s2.glbimg.com/GjtQwSQm6KXy3IARflY3P9QgCtI=/0x0:1920x1080/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2021/w/P/iwBk2HShy32lBXnh6flg/efotball-mesi.jpg",
  },
];

const getValidGame = () => games.filter(Boolean); // this function will check whether there is a game (object) which is not null or undefined in the array of games

const getGameById = (id) => getValidGame().find((game) => game.id === id); // this function will find an object (game) in the array of games by its id and will return the entire object

const getGameIndexById = (id) => getValidGame().findIndex((game) => game.id === id); // this function will find an object (game) in the array of games by its id and will return only its index in the array

// homepage route
app.get("/", (req, res) => {
  res.send(`Welcome to Carlos' list of games!`);
});

// GET route - returns all games in the array of games
app.get("/games", (req, res) => {
  res.json({ games });
});

// GET route (games by id) - return a single game if the id is valid
app.get("/games/:idGame", (req, res) => {
  const id = +req.params.idGame;
  const game = getGameById(id);

  // conditional verification of an existing game
  !game
    ? res.status(404).send({ error: "Game not found. Check if it exists" })
    : res.json({ game });
});

// POST route - creates a new id automatically for the game and check whether the new object is valid or not
app.post("/games", (req, res) => {
  const game = req.body;

  if (
    !game ||
    !game.name ||
    !game.year ||
    isNaN(game.year) || // forces the year to be a Number type
    !game.studio ||
    !game.genre ||
    !game.image ||
    validURL.isUri(game.image) === false || // forces the image to be an URL
    validImg(game.image) === false // forces the URL's extension to be an image
  ) {
    res
      .status(400)
      .send({
        error:
          "Invalid game! Please check whether you have fulfilled all fields correctly",
      });
    return;
  }

  const lastGame = games[games.length - 1]; // get the last object existant in the array of games (last index)

  // if the array has objects into it, the new game id will be the last game's id + 1. Otherwise, the new games's id will be equal to 1. In both occasions, the new game will be inserted if valid
  if (games.length) {
    game.id = lastGame.id + 1;
    games.push(game);
  } else {
    games.id = 1;
    games.push(game);
  }

  res.status(201).send({ game });
});

// PUT route (game by id) - alters a game by its id
app.put("/games/:id", (req, res) => {
  const id = +req.params.id;
  const gameIndex = getGameIndexById(id);

  // checking whether the id is valid or not
  if (gameIndex < 0) {
    res.status(404).send({ error: "Game not found" });
    return;
  }

  const newGame = req.body;

  if (
    !newGame ||
    !newGame.name ||
    !newGame.year ||
    isNaN(newGame.year) || // forces the year to be a Number type
    !newGame.studio ||
    !newGame.genre ||
    !newGame.image ||
    validURL.isUri(newGame.image) === false || // forces the image to be an URL
    validImg(newGame.image) === false // forces the URL's extension to be an image
  ) {
    res
      .status(400)
      .send({
        error:
          "Invalid game! Please check whether you have fulfilled all fields correctly",
      });
    return;
  }

  // if the new object (newGame) is valid, it is gonna replace the current game in the array of games
  const game = getGameById(id);
  newGame.id = game.id;
  games[gameIndex] = newGame;

  res.status(200).send({ game });
});

// DELETE route (game by id) - delete a game by its id
app.delete("/games/:id", (req, res) => {
  const id = +req.params.id;
  const gameIndex = getGameIndexById(id);

  // checking whether the id is valid or not
  if (gameIndex < 0) {
    res.status(404).send({ error: "Game not found" });
    return;
  }

  // splice is gonna delete the game from the array of games by its id. Requires a second parameter that is the deleteCount. The deleteCount should be equal to 1 in this case, in order to delete ONLY the game requested by id
  games.splice(gameIndex, 1);

  res.send({ message: "Game has been succesfully deleted" });
});

// app.listen must be in the bottom of the code. It receives two parameters: the port and especially a callback function that returns a message in the console
app.listen(port, () => {
  console.log(`Server running http://localhost:${port}`);
});
