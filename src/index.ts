import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

// Connect to the database using the DATABASE_URL environment
//   variable injected by Railway
const pool = new pg.Pool();

const app = express();
const port = process.env.PORT || 3333;
var cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));
app.use(cors({origin:true,credentials: true}));

app.get("/games/:appIDs", async (req, res) => {
  //console.log(req.params.appIDs);
  const { rows } = await pool.query("SELECT * FROM GAMES WHERE APPID IN "+ req.params.appIDs);
  console.log("data gathered!")
  console.log(rows);
  res.send(`${rows}`);
});

//takes an object of the form {games: [gameJson,gameJson,gameJson...]}
app.post("/games", async (req, res) => {
  //console.log(req.body);
  const games = req.body.games;
  const gamesValues = [];
  for (var i in games){
    gamesValues.push('('+
    games[i].appID + ',\'' +
    games[i].name + '\',\'' +
    games[i].isMultiplayer + '\',\'' +
    games[i].isOnlineMultiplayer + '\',\'' +
    games[i].isLocalMultiplayer + '\',\'' +
    games[i].isSupportGamepad + '\',\'' +
    games[i].isVirtualReality + "\')")
  }
  const query = "INSERT INTO games (appID, name, isMultiplayer, isOnlineMultiplayer, isLocalMultiplayer, isSupportGamepad, isVirtualReality) VALUES"+ gamesValues +";"
  //console.log(query);
  try{
    await pool.query(query);
    res.send('Added new game(s) to DB successfully');
  } catch (error) {
    console.log(error);
    res.send("An error occured.");
  }
});

//takes an appid and a parameter, then updates it
app.put("/games", async (req, res) => {
  //console.log(req.body);
  const game = req.body;
  const query = "UPDATE games SET " +
    req.body.column + '=\'' + req.body.value +
    "\' WHERE appid = " + req.body.appID + ";"
  //console.log(query);
  try{
    await pool.query(query);
    res.send('Updates game in DB successfully');
  } catch (error) {
    console.log(error);
    res.send("An error occured.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/*
curl -H "Content-Type: application/json" \
  --request PUT \
  -d '{"appID":"421","column":"name","value":"Weed4"}' \
  http://localhost:3333/games/

curl -H "Content-Type: application/json" \
  --request POST \
  -d '{"games":[
  {"appID":426,"name":"Weed2","isMultiplayer":"false","isOnlineMultiplayer":"true","isLocalMultiplayer":"false","isSupportGamepad":"true","isVirtualReality":"true"}, 
  {"appID":427,"name":"Weed2","isMultiplayer":"false","isOnlineMultiplayer":"true","isLocalMultiplayer":"false","isSupportGamepad":"true","isVirtualReality":"true"}, 
  {"appID":428,"name":"Weed2","isMultiplayer":"false","isOnlineMultiplayer":"true","isLocalMultiplayer":"false","isSupportGamepad":"true","isVirtualReality":"true"}]}' \
  http://localhost:3333/games/

curl 'http://localhost:3333/games/(421,422,5)'
*/