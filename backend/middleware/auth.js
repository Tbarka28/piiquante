const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupération du token d'authentification
    // split pour tout récupérer après l'espace dans le header
    const token = req.headers.authorization.split(" ")[1];
     // On vérifie si le token correspond à la clé secrète JWT
    const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
    // Récupération du userId encodé dans le token
    const userId = decodedToken.userId;
    // On crée l'attribut auth qu'on ajoute à la requête pour lui attribuer ensuite l'userId
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error });
  }
};
