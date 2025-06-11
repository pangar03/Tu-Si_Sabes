// server/controller/users.controller.js
const { getUsers, register, login } = require("../db/users.db");

const getUsersController = async (req, res) => {
  const response = await getUsers();
  res.send(response);
};

const registerController = async (req, res) => {
  const user = req.body;

  if (user.password !== user.confirmPassword) {
    return res.send({ code: 400, message: "Las contraseñas no coinciden" });
  }

  const id = Date.now();

  const response = await register({ ...user, id }); // Ya está correcto con await

  res.send(response);
};

const loginController = async (req, res) => {
  const user = req.body;
  const response = await login(user); // AGREGAR await aquí

  res.send(response);
};

module.exports = {
  getUsersController,
  registerController,
  loginController,
};
