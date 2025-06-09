// login.js
import { makeRequest, navigateTo } from "../app.js";

export default function renderLogin(data = {}) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="auth-container">
    <form id="login-form" class="auth-form">
    <h2>¡Parchemos juntos!</h2>
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" name="password" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Iniciar Sesión</button>
        </div>
        <p id="login-message" class="message ${data.messageType || ""}">
          ${data.message || ""}
        </p>
        <p class="switch-form">
          ¿No tienes una cuenta? <a href="#" id="go-to-register">Regístrate aquí</a>
        </p>
      </form>
    </div>
  `;

  // Manejar el envío del formulario
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const response = await makeRequest("/login", "POST", {
          username,
          password,
          organization: false,
        });

        if (response.code === 200) {
          // Login exitoso
          navigateTo("/dashboard", {
            user: { username },
            message: "Sesión iniciada correctamente",
            messageType: "success",
          });
        } else {
          // Mostrar mensaje de error
          document.getElementById("login-message").textContent =
            response.message;
          document.getElementById("login-message").className = "message error";
        }
      } catch (error) {
        document.getElementById("login-message").textContent =
          "Error al conectar con el servidor";
        document.getElementById("login-message").className = "message error";
      }
    });

  // Enlace para cambiar al formulario de registro
  document
    .getElementById("go-to-register")
    .addEventListener("click", function (e) {
      e.preventDefault();
      navigateTo("/register");
    });
}
