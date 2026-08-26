const app = document.querySelector<HTMLDivElement>("#app");

export function displayRegister() {
  if (app) {
    app.innerHTML = `
      <div class="cred-form">
        <form class="centered-form" id=register>
          <input id="name" type="text" placeholder="Name" required>
          <input id="email" type="text" placeholder="Email" required>
          <input id="first-password" type="password" placeholder="Password" required>
          <input id="confirm-password" type="password" placeholder="Confirm Password" required>
          <button type="submit">Register</button>
          <a id="login-link" href="#">Already have an account?</a>
        </form>
      </div>
      `;
  }
}

export function displayLogin() {
  if (app) {
    app.innerHTML = `
      <div class="cred-form">
        <form class="centered-form" class="cred-form" id=login>
          <input id="email" type="text" placeholder="Email" required>
          <input id="password" type="password" placeholder="Password" required>
          <button type="submit">Login</button>
          <p class="error">
        </form>
      </div>
      `;
  }
}
