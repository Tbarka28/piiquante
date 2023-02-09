const bcrypt = require("bcrypt");
const jwt = require ('jsonwebtoken');
const User = require("../models/user");
// Création d'un compte utilisateur 
exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Connexion à un compte utilisateur avec un token
exports.login = (req, res, next) => {
    // on vérifie si l'email utilisateur existe dans la base de donneés
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                // s'il n'existe pas
                return res.status(401).json({ message: 'login incorrecte'});
            }
            // on compare les entrées et les données
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        // si c'est différent
                        return res.status(401).json({ message: 'mot de passe incorrecte' });
                    }
                     // si c'est bon, on envoie l'objet suivant
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                             // Arguments : userId, clé cryptage, durée de validité
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };
