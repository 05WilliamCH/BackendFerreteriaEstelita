const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validinfo");
const authorization = require("../middleware/authorization");

//registering
router.post("/register", validInfo, async (req, res) => {
  //1. destructure the req.body (name, mail, password)
  const { name, email, password } = req.body;

  try {
    //2. Check if user exist (if user exist then trow error)
    const user = await pool.query("SELECT * FROM usuario WHERE email = $1", [
      email,
    ]);

    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }

    //3. Bcrypt the user password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    //4. Enter the new user inside our databse
    let newUser = await pool.query(
      "INSERT INTO usuario (nombre, email, usuario_password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    //5. Generating our jwt token
    const jwtToken = jwtGenerator(newUser.rows[0].id_usuario);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {
  //1. Destructure the req.body
  const { email, password } = req.body;

  //Impresion del body de la peticion
  console.log(req.body);

  try {
    //2. Check if user doesn´t exist (if not then we throw error)
    const user = await pool.query("SELECT * FROM usuario WHERE email = $1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Invalid Credential");
    }

    //3. Check if incomming password is the same the database password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].usuario_password
    );

    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }

    //4. give them the jwt token
    const token = jwtGenerator(user.rows[0].id_usuario);
    const nombre = user.rows[0].nombre;
    return res.json({ token, nombre });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/verify", authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.massage);
    res.status(500).send("Error del servidor");
  }
});

module.exports = router;
