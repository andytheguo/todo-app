import './styles.css';

import type { Task } from './types';

const app = document.querySelector<HTMLDivElement>("#app");

// TODO:
// Handle errors better - don't just print them out to console

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

async function displayTasks() {
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
        <textarea class="task-title">Title</textarea>
        <textarea class="task-description">Description...</textarea>
        <button id="create-button">Create Task</button>
      </div>
    </div>
    <div class="modal" id="edit-modal">
      <div class="modal-header">
        <h1>Edit Task</h1>
        <button data-close-button>&times;</button>
      </div>
      <div class="modal-body">
        <textarea class="task-title"></textarea>
        <textarea class="task-description"></textarea>
        <button id="save-button">Save</button>
      </div>
    </div>
    <div id="overlay"></div>
    `;

  const tasks = await getTasks();
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  for (const task of tasks) {
    const taskDiv = createTaskDiv(task);
    (task.complete ? completeDiv! : incompleteDiv!).appendChild(taskDiv);
  }
}

function setupModalOpen(button: HTMLButtonElement, overlay: HTMLDivElement) {
  button.addEventListener("mouseup", () => {
    const modal = document.querySelector<HTMLDivElement>(button.dataset.modalTarget!);

    if (!modal) {
      throw new Error("Open modal button is missing a target");
    }

    openModal(modal, overlay);
  });
}

function setupModalClose(button: HTMLButtonElement, overlay: HTMLDivElement) {
  button.addEventListener("mouseup", () => {
    const modal = button.closest<HTMLDivElement>(".modal");

    if (!modal) {
      throw new Error("Close modal button is not the child of a modal class");
    }

    closeModal(modal, overlay);
  });
}

function setupCreateBtn(createButton: HTMLButtonElement) {
  createButton.addEventListener("mouseup", async () => {
    try {
      const title = document.querySelector<HTMLTextAreaElement>("#task-modal .task-title");
      const description = document.querySelector<HTMLTextAreaElement>("#task-modal .task-description");
      await createTask(title!.value, description!.value);
      changeState("tasks");
    }
    catch (e) {
      console.error(e);
    }
  });
}

function setupSaveBtn(task: Task, saveButton: HTMLButtonElement) {
  try {
    saveButton.addEventListener("mouseup", async () => {
      const title = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-title");
      const description = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-description");
      await patchTask(task, title!.value, description!.value);
      changeState("tasks");
    });
  }
  catch (e) {
    console.error(e);
  }
}

function setupModals() {
  const openModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-modal-target]");
  const closeModalButtons = document.querySelectorAll<HTMLButtonElement>("[data-close-button]");
  const overlay = document.querySelector<HTMLDivElement>("#overlay");

  openModalButtons.forEach(button => setupModalOpen(button, overlay!));
  closeModalButtons.forEach(button => setupModalClose(button, overlay!));

  const createButton = document.querySelector<HTMLButtonElement>("#create-button");
  setupCreateBtn(createButton!);
}

async function setupTaskCheck(task: Task) {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`http://localhost:3000/user/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        complete: !task.complete
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
}

async function setupTaskDelete(task: Task) {
  const accessToken = localStorage.getItem("accessToken");

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
}

async function setupTaskEdit(task: Task) {
  const editTitle = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-title");
  const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-description");

  if (!editTitle || !editDesciption) {
    throw new Error("");
  }

  editTitle.textContent = task.title;

  if (task.description) editDesciption.textContent = task.description;
}

function createTaskDiv(task: Task) {
  const taskDiv = document.createElement("div");
  taskDiv.classList = "task";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = task.complete;
  check.addEventListener("change", () => setupTaskCheck(task));

  const delBtn = document.createElement("button");
  delBtn.textContent = "DELETE";
  delBtn.id = "delete-btn";
  delBtn.addEventListener("mouseup", () => setupTaskDelete(task));

  const saveBtn = document.querySelector<HTMLButtonElement>("#save-button");
  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.id = "edit-btn";
  editBtn.dataset.modalTarget = "#edit-modal";
  editBtn.addEventListener("mouseup", () => {
    setupTaskEdit(task)
    setupSaveBtn(task, saveBtn!);
  });

  const title = document.createElement("h2");
  title.textContent = task.title;

  if (task.description) {
    const description = document.createElement("p");
    description.textContent = task.description;
    taskDiv.append(check, title, description, delBtn, editBtn);
  }
  else {
    taskDiv.append(check, title, delBtn, editBtn);
  }

  return taskDiv;
}

async function patchTask(task: Task, title: string, description?: string) {
  const accessToken = localStorage.getItem("accessToken");

  const res = await fetch(`http://localhost:3000/user/tasks/${task.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      title: title,
      description: description
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

async function createTask(title: string, description?: string) {
  const accessToken = localStorage.getItem("accessToken");

  const res = await fetch("http://localhost:3000/user/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      title: title,
      description: description
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

function openModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function closeModal(modal: HTMLDivElement, overlay: HTMLDivElement) {
  if (!modal) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}

async function showTasks() {
  try {
    await displayTasks();
    setupModals();
  }
  catch (e) {
    console.error(e);
  }
}

function setupRegister() {
  try {
    displayRegister();
    onRegister();
  }
  catch (e) {
    console.error(e);
  }
}

function setupLogin() {
  try {
    displayLogin();
    onLogin();
  }
  catch (e) {
    console.error(e);
  }
}

function changeState(state: string) {
  switch (state) {
    case "register": {
      setupRegister();
      break;
    }
    case "login": {
      setupLogin();
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

changeState("register");
