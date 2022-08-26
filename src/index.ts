import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

// Connect to the database using the DATABASE_URL environment
//   variable injected by Railway
const pool = new pg.Pool();

const app = express();
const port = process.env.PORT || 3333;

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.custom-type" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/games/:appIDs", async (req, res) => {
  console.log(req.params.appIDs);
  const { rows } = await pool.query("SELECT * FROM GAMES WHERE APPID IN "+ req.params.appIDs);
  console.log(rows);
  res.send(`${rows}`);
});

app.post("/games", async (req, res) => {
  //console.log(req.body);
  const game = req.body;
  const query = "INSERT INTO games (appID, name, isMultiplayer, isOnlineMultiplayer, isLocalMultiplayer, isSupportGamepad, isVirtualReality) VALUES(" +
  game.appID + ',\'' + game.name + '\',\'' + game.isMultiplayer + '\',\'' + game.isOnlineMultiplayer + '\',\'' + game.isLocalMultiplayer + '\',\'' + game.isSupportGamepad + '\',\'' + game.isVirtualReality + "\');"
  //console.log(query);
  try{
    await pool.query(query);
    res.send('Added new game to DB successfully');
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
  -d '{"appID":"421","name":"Weed2","isMultiplayer":"false","isOnlineMultiplayer":"true","isLocalMultiplayer":"false","isSupportGamepad":"true","isVirtualReality":"true"}' \
  http://localhost:3333/games/

curl 'http://localhost:3333/games/(421,422,5)'
*/