import './styles.css';

import type { Task } from './types';

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

  return data;
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

  if (!res.ok) {
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
          <p id="error">
        </form>
      </div>
      `;
  }
}

function displayTasks(tasks: Task[]) {
  if (!app) return;

  app.innerHTML = `
    <div id="tasks-header">
      <h1>Tasks</h1>
      <button data-modal-target="#task-modal" id="add-button">Add Task</button>
    </div>
    <div id="tasks">
      <div id="incomplete-tasks">
        <h2>In Progress</h2>
      </div>
      <div id="complete-tasks">
        <h2>Completed</h2>
      </div>
    </div>
    <div class="modal" id="task-modal">
      <div class="modal-header">
        <h1>New Task</h1>
        <button data-close-button>&times;</button>
      </div>
      <div class="modal-body">
        <textarea id="task-title">Title</textarea>
        <textarea id="task-description">Description...</textarea>
        <button id="create-button">Create Task</button>
      </div>
    </div>
    <div id="overlay"></div>
    `;

  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  const accessToken = localStorage.getItem("accessToken");
  for (const task of tasks) {
    const taskDiv = document.createElement("div");
    taskDiv.classList = "task";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.complete;

    const delBtn = document.createElement("button");
    delBtn.textContent = "DELETE";

    check.addEventListener("change", async () => {
      try {
        const res = await fetch(`http://localhost:3000/user/tasks/${task.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            complete: check.checked
          })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        changeState("tasks");
      }
      catch (e) {
        console.error(e);
      }
    });

    delBtn.addEventListener("mouseup", async () => {
      try {
        const res = await fetch(`http://localhost:3000/user/tasks/${task.id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${accessToken}`
          }
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        changeState("tasks");
      }
      catch (e) {
        console.error(e);
      }
    });

    const title = document.createElement("h2");
    title.textContent = task.title;

    let description;
    if (task.description) {
      description = document.createElement("p");
      description.textContent = task.description;
    }

    taskDiv.append(check, title, description, delBtn);

    (task.complete ? completeDiv : incompleteDiv).appendChild(taskDiv);
  }

  const openModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-close-button]");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");

  openModalButtons.forEach(button => {
    button.addEventListener("mouseup", () => {
      const modal = document.querySelector(button.dataset.modalTarget);
      openModal(modal, overlay);
    });
  });

  closeModalButtons.forEach(button => {
    button.addEventListener("mouseup", () => {
      const modal = button.closest(".modal");
      closeModal(modal, overlay);
    });
  });
}

function openModal(modal, overlay) {
  if (!modal) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal, overlay) {
  if (!modal) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

// TODO: Need to handle errors from getTasks()
async function showTasks() {
  const tasks = await getTasks();
  displayTasks(tasks);
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
    case "tasks": {
      showTasks();
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
      changeState("tasks");
    }
    catch (e) {
      const errP = document.querySelector<HTMLParagraphElement>("#error");
      errP.textContent = e.message;
      errP.style.visibility = "visible";
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
