// Importer le package 'multer'
// Multer nous permet de gérer les fichiers entrants dans les requêtes HTTP.
const multer = require("multer");
// Types de fichiers acceptés
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
// la config de multer nécessite deux arguments
const storage = multer.diskStorage({
  // 1) indiquer à 'multer' dans quel dossier il doit enregistrer les fichiers
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  // 2) expliquer à 'multer' quel nom de fichier à utiliser
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});
// Exporter le middleware multer
module.exports = multer({ storage: storage }).single("image");
