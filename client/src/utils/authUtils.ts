import { changeState } from "./stateManager";
import { displayLogin, displayRegister } from "../ui/authUI";

async function register() {
  const name = document.querySelector<HTMLInputElement>("#name");
  const email = document.querySelector<HTMLInputElement>("#email");
  const password = document.querySelector<HTMLInputElement>("#first-password");
  const confirmation = document.querySelector<HTMLInputElement>("#confirm-password");

  if (!name || !email || !password || !confirmation) {
    throw new Error("Registration form has not loaded yet");
  }

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

async function login() {
  const email = document.querySelector<HTMLInputElement>("#email");
  const password = document.querySelector<HTMLInputElement>("#password");

  if (!email || !password) {
    throw new Error("Login form has not loaded yet");
  }

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

  if (!res.ok) {
    throw new Error(data.error);
  }

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  // TODO: remove this
  console.log(data);
}

function onLogin() {
  const loginForm = document.querySelector<HTMLFormElement>("#login");
  const errP= document.querySelector<HTMLParagraphElement>("#error");

  if (!loginForm || !errP) {
    throw new Error("Login form has not loaded yet");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await login();
      changeState("tasks");
    }
    catch (e) {
      errP.textContent = (e as Error).message;
      errP.style.visibility = "visible";
      console.error(e);
    }
  });
}

function onRegister() {
  const registerForm = document.querySelector<HTMLFormElement>("#register");
  const loginLink = document.querySelector<HTMLLinkElement>("#login-link");

  if (!registerForm || !loginLink) {
    throw new Error("Registration form has not loaded yet");
  }

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

export function setupRegister() {
  try {
    displayRegister();
    onRegister();
  }
  catch (e) {
    console.error(e);
  }
}

export function setupLogin() {
  try {
    displayLogin();
    onLogin();
  }
  catch (e) {
    console.error(e);
  }
}
