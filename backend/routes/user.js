//importer Express afin de creer un routeur
const express = require("express");
//créer le routeur
const router = express.Router();
const userCtrl = require("../controllers/user");
// Route pour la création d'un utlisateur
router.post("/signup", userCtrl.signup);
// Route pour la connexion d'un utilisateur
router.post("/login", userCtrl.login);
// exporter le routeur
module.exports = router;
