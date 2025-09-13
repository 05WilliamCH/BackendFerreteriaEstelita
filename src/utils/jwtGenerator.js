const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id) {
  //Instanciando un payload para el token, esto con el id del usuario
  const payload = {
    user: {
      id: user_id,
    },
  };

  //   function jwtGenerator(user_id) {
  //   const payload = {
  //     user: user_id
  //   };

  //Retornamos el token
  //primeroParload.seguidoPalabraSecretaDelENV
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "10h" });
}

module.exports = jwtGenerator;
