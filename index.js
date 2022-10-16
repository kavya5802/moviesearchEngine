const express = require("express");
const request =require('request');
const app = express();
const port = 3000;
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

var serviceAccount = require("./key.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

app.set("view engine", "ejs");
app.use('/public', express.static('public'));


app.get("/", (req, res) => {
  res.render("signup");
});

app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signinsubmit", (req, res) => {
  const email = req.query.email;
  const password = req.query.password;

  db.collection("users")
    .where("email", "==", email)
    .where("password", "==", password)
    .get()
    .then((docs) => {
      if (docs.size > 0) {
        var usersData = [];
        db.collection("users")
          .get()
          .then((docs) => {
            docs.forEach((doc) => {
              usersData.push(doc.data());
            });
          })
          .then(() => {

            res.render("home", { userData: usersData });
          });
      } else {
        res.send("Login failed");
      }
    });
});

app.get("/signupsubmit", (req, res) => {
  const full_name = req.query.full_name;
  const last_name = req.query.last_name;
  const email = req.query.email;
  const password = req.query.password;
  db.collection("users")
    .add({
      name: full_name + last_name,
      email: email,
      password: password,
    })
    .then(() => {
      res.render("signin.ejs")
    });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/getMovie", function (req, res) {
  res.render("home.ejs");
});

app.get("/movieName", function (req, res) {
  const movieNameeee = req.query.name_of_movie;

  request(
    "http://www.omdbapi.com/?t=" + movieNameeee + "&apikey=16f2a552",
    function (error, response, body) {
      console.log(JSON.parse(body));
      if (JSON.parse(body).Response == "True") { 
        const Genre = JSON.parse(body).Genre;
        const Plot = JSON.parse(body).Plot;
        const Year = JSON.parse(body).Year;
        const imdbRating= JSON.parse(body).imdbRating;
        const Actors = JSON.parse(body).Actors;
        const Language = JSON.parse(body).Language;
        const director = JSON.parse(body).Director;
        const image = JSON.parse(body).Poster;

        res.render("result.ejs", {
          director: director,
          moveiName: movieNameeee,
          YearOfRelease :Year,
          Genre : Genre,
          Actors:Actors,
          Language:Language,
          Rating:imdbRating,
          Poster:image,
          Plot:Plot
        });
      } else {
        res.send("SOmethig went wrong");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});