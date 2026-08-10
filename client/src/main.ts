const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
  app.innerHTML = `
    <form id=login>
      <input id="email" type="text" placeholder="Email" required>
      <input id="password" type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    `;
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
    throw new Error(data.erro);
  }

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);

  console.log(data);
}

const form = document.querySelector<HTMLFormElement>("#login");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await login();
    getTasks();
  }
  catch (e) {
    console.error(e);
  }
});
