// importer express
const express = require("express");
// Créer l'application 'express'
const app = express();
// importer mongoose
const mongoose = require("mongoose");
// importer sauce
const sauce = require("./models/sauce");
// importer userRoutes
const userRoutes = require("./routes/user");
// importer sauceRoutes
const sauceRoutes = require("./routes/sauce");
// Importer de 'path' qui donne accès au chemin de fichiers
const path = require("path");
const cors = require ('cors');
require('dotenv').config();
// Connexion à la base de données
mongoose 
  .connect(process.env.CHAINE_MONGODB,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));


// Analyser le corps de la requête HTTP
app.use(express.json());
app.use(cors());
//enregistrer les routes
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

// exporte l'app pour l'utiliser dans les autres fichiers
module.exports = app;
