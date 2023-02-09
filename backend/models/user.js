// Importer Mongoose
const mongoose = require("mongoose");
// Importer mongoose-unique-validator pour empecher la création de deux comptes avec le même email
const uniqueValidator = require("mongoose-unique-validator");
// le schéma de données d'un utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },/*le champs est requit*/
  password: { type: String, required: true },
});
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
