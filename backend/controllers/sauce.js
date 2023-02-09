const Sauce = require("../models/sauce");
// (fs) file-system, nous permet de modifier et supprimer un fichier
const fs = require("fs");
// Ajouter une nouvelle sauce
/*
 * Récupèrer la requête et transformer la chaine de caractère en objet (parse)
 * supprimer l'_id de l'objet (un nouveau sera créé automatiquement par la mongoDB)
 * supprime l'userID de la requête (pour empêcher quelqu'un de modifier/supprimer un objet)
 * constante de création d'une nouvelle instance du modele sauce et on lui passe l'objet
 * l'objet contient tous les informations grâce à l'opérateur spread (...)
 * Intégration du UserId via le token d'authentification
 * imageUrl indique le chemin
 * sauvegarde l'objet sauce dans la BDD + promesse de réponse et catch pour les erreurs
 */

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked:[],
    usersDisliked:[]
  });

  sauce
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      next(error);
      //res.status(400).json({ error });
    });
};
// Fonction pour l'affichage d'une sauce
exports.oneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};

// Fonction pour l'affichage de toutes les sauces
exports.allSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

// Modifier une sauce
exports.modifySauce = (req, res, next) => {
  // Objet pour vérifier si il y a un fichier dans notre requête
  const sauceObject = req.file
    ? {
        // Si oui : Parser objet requête
        ...JSON.parse(req.body.sauce),
        /*
        // Générer URL de l'image
         * req.protocal = récupérer le protocal de notre lien : http ou https
         * req.get('host') = permet de récupérer l'URL de notre lien : localhost
         * req.file.filename = permet de récupérer le nom du fichier
         */
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : // Si non : on récupère le body de la requête
      { ...req.body };
  // Supprimer "userId" de la requête
  delete sauceObject._userId;
  // Récupérer la sauce dans la base de données avec son id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérifier id utilisateur base de données/requête(token-auth)
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Modifier objet avec contenu requête
        Sauce.updateOne(
          { _id: req.params.id },
          { ...sauceObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};
// Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  // Récupérer la sauce dans la base de données avec son id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérifier id utilisateur base de données/requête(token-auth)
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        // Récupérer nom fichier image avec méthode "split"
        const filename = sauce.imageUrl.split("/images/")[1];
        // Supprimer fichier du serveur avec fonction "unlink" de FS
        fs.unlink(`images/${filename}`, () => {
          //supprimer la sauce dans la base de données
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

//Liker une sauce
exports.likeSauce = (req, res, next) => {
  //Recherche dans la BDD l'_id correspondant à la sauce likée
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Like = 1 => L'utilisateur aime la sauce (like = +1)
      // Si userID n'est  pas présent dans le tableau (!includes) et like = 1, incrémente 1 et on ajoute l'userLiked.
      if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            // Incremente 1 à la BDD sur likes
            $inc: { likes: 1 },
            // PUSH usersLiked à la BDD
            $push: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(200).json({ message: "Like ajouté." }))
          .catch();
      }
      // Like = 0  => L'utilisateur annule son like (like = 0)
      if (sauce.usersLiked.includes(req.body.userId) && req.body.like === 0) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { usersLiked: req.body.userId },
          }
        )
          .then(() => res.status(200).json({ message: "Like retiré" }))
          .catch();
      }
      //Like = -1 => L'utilisateur n'aime pas la sauce (dislike = +1)
      if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: 1 },
            $push: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Dislike ajouté." }))
          .catch();
      }

      if (sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0 ) {
        Sauce.updateOne(
          { _id: req.params.id },
          {
            $inc: { dislikes: -1 },
            $pull: { usersDisliked: req.body.userId },
          }
        )
          .then(() => res.status(201).json({ message: "Dislike retiré." }))
          .catch();
      } else {
        return false;
      }
    })
    .catch((error) => res.status(404).json({ error: error }));
};
