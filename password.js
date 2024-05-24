const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const password = "azerty";

// Créer 16 caractère au hasard
const salt = uid2(16);

// Créer un word array
const hash = SHA256(password + salt);

// Modifie le word array afin d'obtenir une string
const finalHash = SHA256(password + salt).toString(encBase64);

// Créer un token de 20 caractère
const token = uid2(20);
