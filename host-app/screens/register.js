// register.js
import { makeRequest, navigateTo } from "../app.js";

export default function renderRegister(data = {}) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="auth-container">
      <h2>Crear Cuenta</h2>
      <form id="register-form" class="auth-form">
        <div class="form-group">
          <label for="username">Usuario:</label>
          <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required>
        </div>
          <div class="form-group">
          <label for="date">Edad:</label>
          <input type="date" id="date" name="date" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" name="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Registrarse</button>
        </div>
        <p id="register-message" class="message ${data.messageType || ""}">
          ${data.message || ""}
        </p>
        <p class="switch-form">
          ¿Ya tienes una cuenta? <a href="#" id="go-to-login">Inicia sesión aquí</a>
        </p>
      </form>
    </div>
  `;

  // Manejar el envío del formulario
  document
    .getElementById("register-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const date = document.getElementById("date").value;
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validación básica
      if (password !== confirmPassword) {
        document.getElementById("register-message").textContent =
          "Las contraseñas no coinciden";
        document.getElementById("register-message").className = "message error";
        return;
      }

      try {
        const response = await makeRequest("/register", "POST", {
          username,
          email,
          date,
          password,
          confirmPassword,
          isHost: true,
        });

        if (response.code === 200) {
          // Registro exitoso, redirigir a login
          navigateTo("/login", {
            message:
              "Cuenta creada correctamente. Inicia sesión con tus credenciales.",
            messageType: "success",
          });
        } else {
          // Mostrar mensaje de error
          document.getElementById("register-message").textContent =
            response.message;
          document.getElementById("register-message").className =
            "message error";
        }
      } catch (error) {
        document.getElementById("register-message").textContent =
          "Error al conectar con el servidor";
        document.getElementById("register-message").className = "message error";
      }
    });

  // Enlace para cambiar al formulario de login
  document
    .getElementById("go-to-login")
    .addEventListener("click", function (e) {
      e.preventDefault();
      navigateTo("/login");
    });
}
