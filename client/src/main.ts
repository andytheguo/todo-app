import './styles.css';

const app = document.querySelector<HTMLDivElement>("#app");

async function register() {
  const name = document.querySelector<HTMLInputElement>("#name");
  const email = document.querySelector<HTMLInputElement>("#email");
  const password = document.querySelector<HTMLInputElement>("#first-password");
  const confirmation = document.querySelector<HTMLInputElement>("#confirm-password");

  if (password.value !== confirmation.value) {
    throw new Error("Passwords must match")
  }

  const res = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      password: password.value
    })
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  // TODO: remove this:
  console.log("Successfully logged in!");
}

async function getTasks() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const res = await fetch("http://localhost:3000/user/tasks", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  // TODO: remove this
  console.log(data);
}

async function login() {
  const email = document.querySelector<HTMLInputElement>("#email");
  const password = document.querySelector<HTMLInputElement>("#password");

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();

  if (!res) {
    throw new Error(data.error);
  }

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  // TODO: remove this
  console.log(data);
}

function displayRegister() {
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

function displayLogin() {
  if (app) {
    app.innerHTML = `
      <div class="cred-form">
        <form class="centered-form" class="cred-form" id=login>
          <input id="email" type="text" placeholder="Email" required>
          <input id="password" type="password" placeholder="Password" required>
          <button type="submit">Login</button>
        </form>
      </div>
      `;
  }
}

function changeState(state: string) {
  switch (state) {
    case "register": {
      displayRegister();
      onRegister();
      break;
    }
    case "login": {
      displayLogin();
      onLogin();
      break;
    }
  }
}

function onLogin() {
  const loginForm = document.querySelector<HTMLFormElement>("#login");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await login();
      await getTasks();
    }
    catch (e) {
      console.error(e);
    }
  });
}

function onRegister() {
  const registerForm = document.querySelector<HTMLFormElement>("#register");
  const loginLink = document.querySelector<HTMLLinkElement>("#login-link");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await register();
      changeState("login");
    }
    catch (e) {
      console.error(e);
    }
  });

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    changeState("login");
  })
}

changeState("register");
