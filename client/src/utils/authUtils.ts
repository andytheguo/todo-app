import { displayLogin, displayRegister } from "../ui/authUI";
import { routeManager } from "./router";

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
}

function onLogin() {
  const loginForm = document.querySelector<HTMLFormElement>("#login");
  const registerLink = document.querySelector<HTMLLinkElement>("#register-link");
  const err = document.querySelector<HTMLParagraphElement>(".error");

  if (!loginForm || !registerLink || !err) {
    throw new Error("Login form has not loaded yet");
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await login();
      routeManager.route("/dashboard");
    }
    catch (e) {
      err.textContent = (e as Error).message;
      err.classList.add("active");
      console.error(e);
    }
  });

  registerLink.addEventListener("click", (event) => {
    event.preventDefault();
    routeManager.route("/register");
  });
}

function onRegister() {
  const registerForm = document.querySelector<HTMLFormElement>("#register");
  const loginLink = document.querySelector<HTMLLinkElement>("#login-link");
  const err = document.querySelector<HTMLParagraphElement>(".error");

  if (!registerForm || !loginLink || !err) {
    throw new Error("Registration form has not loaded yet");
  }

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await register();
      routeManager.route("/login");
    }
    catch (e) {
      err.textContent = (e as Error).message;
      err.classList.add("active");
      console.error(e);
    }
  });

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    routeManager.route("/login");
  });
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

export function setupSignOutBtn() {
  const refreshToken = localStorage.getItem("refreshToken");
  const signOutBtn = document.querySelector<HTMLButtonElement>(".sign-out");

  signOutBtn!.addEventListener("mouseup", async () => {
    try {
      await authFetch("http://localhost:3000/logout", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          refreshToken: refreshToken
        })
      });

      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      routeManager.route("/register");
    }
    catch (e) {
      console.error(e);
    }
  });
}

async function refreshToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const res = await authFetch("http://localhost:3000/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refreshToken: refreshToken
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  localStorage.setItem("accessToken", data.accessToken);

  return data.accessToken;
}

export async function authFetch(input: string, init: RequestInit) {
  let accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  init.headers = headers;

  let res = await fetch(input, init);

  if (res.status !== 401) {
    return res;
  }

  accessToken = await refreshToken();
  headers.set("Authorization", `Bearer ${accessToken}`);;

  init.headers = headers;

  res = await fetch(input, init);

  return res;
}
