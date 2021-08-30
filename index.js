const express = require("express"); // Must install express module (npm i express). Imports the express module from node_modules
const mongoose = require("./database"); // Imports the database connection
const gameSchema = require("./models/games"); // Imports the database configurations (table)

const validURL = require("valid-url"); // Must install valid-url module (npm i valid-url). This will check whether the string inserted in the object image is an URL or not
const validImg = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
}; // function to check whether the URL's extension refers to an image or not (.jpg, .jpeg, .gif or .png)
const app = express(); // creates the app
const port = 3000; // saves the server's port in a constant

app.use(express.json()); // converts requisitions and responses to JSON

// homepage route
app.get("/", (req, res) => {
  res.send(`Welcome to Carlos' list of games!`);
});

// GET route - return all games in the array of games
app.get("/games", async (req, res) => {
  const games = await gameSchema.find(); // makes Node.js await a database quary to return the results
  res.json({ games }); // returns the results in a JSON format
});

// GET route (games by id) - return a single game if the id is valid
app.get("/games/:id", async (req, res) => {
  const id = req.params.id; // requests the id typed in the URL
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(422).send({ error: "Invalid ID" }); // if the object is not valid, returns an error
    return;
  }

  const game = await gameSchema.findById(id); // awaits a database query and finds a single object bi its id
  
  !game ? res.status(404).send({ error: "Game not found. Check if it exists" }) : res.json({ game }); // conditional verification of an existing game

});

// POST route - create a new id automatically for the game and check whether the new object is valid or not
app.post("/games", async (req, res) => {
  const game = req.body; // requests what has been typed in the body

  // checks if all of the fields requested have been correctly filled and returns an error if not
  if (!game || !game.name || !game.year || isNaN(game.year) || !game.studio || !game.genre || !game.image || validURL.isUri(game.image) === false || validImg(game.image) === false) {
    res.status(400).send({ error: "Invalid game! Please check whether you have filled all fields correctly" });
    return;
  }

  const newGame = await new gameSchema(game).save(); // creates a new game and saves it in the database

  res.status(201).send({ newGame }); // returns the new game created
});

// PUT route (game by id) - alter a game by its id
app.put("/games/:id", async (req, res) => {
  const id = req.params.id; // requests the id typed in the URL

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(422).send({ error: "Invalid ID" }); // if the object is not valid, returns an error
    return;
  }

  const game = await gameSchema.findById(id); // awaits a database query and finds a single object bi its id

  const newGame = req.body; // saves what has been typed in the body in a new constant

  // checks if all of the fields requested have been correctly filled and returns an error if not
  if (!game || !game.name || !game.year || isNaN(game.year) || !game.studio || !game.genre || !game.image || validURL.isUri(game.image) === false || validImg(game.image) === false) {
    res.status(400).send({ error: "Invalid game! Please check whether you have filled all fields correctly" });
    return;
  }

  await gameSchema.findOneAndUpdate({ _id: id }, newGame); // replaces the game by the new game in the same id
  const updatedGame = await gameSchema.findById(id); // gets the new game information

  res.status(200).send({ updatedGame }); // returns the game updated
});

// DELETE route (game by id) - delete a game by its id
app.delete("/games/:id", async (req, res) => {
  const id = req.params.id; // requests the id typed in the URL

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(422).send({ error: "Invalid ID" }); // if the object is not valid, returns an error
    return;
  }

  const game = await gameSchema.findById(id); // awaits a database query and finds a single object bi its id

  if (!game) {
    res.status(404).send({ error: "Game not found" }); // if the game turns out to be null, returns an error message
    return;
  }

  await gameSchema.findByIdAndDelete(id); // awaits a database query and deletes the object by its id

  res.status(200).send({ message: "Game has been succesfully deleted" }); // success message
});

// app.listen must be in the bottom of the code. It receives two parameters: the port and especially a callback function that returns a message in the console
app.listen(port, () => {
  console.log(`Server running http://localhost:${port}`);
});
