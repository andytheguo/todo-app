import type { Task } from "../types";
import { changeState } from "./stateManager";
import { displayTasks } from "../ui/taskUI";
import { setupModals, setupTaskBtns } from "./modalUtils";
import { authFetch } from "./authUtils";

async function updateTask(task: Task, complete: boolean) {
  try {
    const res = await authFetch(`http://localhost:3000/user/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        complete: complete
      })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }

    task.complete = complete;
  }
  catch (e) {
    console.error(e);
  }
}

async function setupTaskDelete(task: Task) {
  try {
    const res = await authFetch(`http://localhost:3000/user/tasks/${task.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  }
  catch (e) {
    console.error(e);
  }
}

async function setupTaskEdit(task: Task) {
  const editTitle = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-title");
  const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-description");

  if (!editTitle || !editDesciption) {
    throw new Error("Edit modal has not loaded yet");
  }

  console.log(task.title);
  editTitle.textContent = task.title;

  if (task.description) editDesciption.textContent = task.description;
}

function setupSaveBtn(task: Task, title: HTMLHeadElement, description: HTMLParagraphElement) {
  const form = document.querySelector<HTMLFormElement>("#edit-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#save-error");

  if (!form) return;

  form!.onsubmit = async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const editTitle = form.querySelector<HTMLTextAreaElement>(".task-title");
      const editDesciption = form.querySelector<HTMLTextAreaElement>(".task-description");
      await patchTask(task, editTitle!.value, editDesciption!.value);

      task.title = editTitle!.value;
      task.description = editDesciption!.value;

      title.textContent = task.title;
      description.textContent = task.description;
    }
    catch (e) {
      err!.textContent = (e as Error).message;
      err!.classList.add("active");
      console.error(e);
    }
  }
}

function setupCheckBox(check: HTMLInputElement, task: Task, taskDiv: HTMLDivElement, incompleteDiv: HTMLDivElement, completeDiv: HTMLDivElement) {
  check.type = "checkbox";
  check.addEventListener("change", async () => {
    await updateTask(task, check.checked);

    const dest = check.checked ? completeDiv : incompleteDiv;
    dest.appendChild(taskDiv);
  });
}

function setupDelBtn(delBtn: HTMLButtonElement, task: Task, taskDiv: HTMLDivElement) {
  delBtn.textContent = "DELETE";
  delBtn.id = "delete-btn";
  delBtn.addEventListener("mouseup", async () => {
    await setupTaskDelete(task);
    taskDiv.remove();
  });
}

function setupEditBtn(editBtn: HTMLButtonElement, task: Task, title: HTMLHeadElement, description: HTMLParagraphElement) {
  editBtn.textContent = "EDIT";
  editBtn.id = "edit-btn";
  editBtn.dataset.modalTarget = "#edit-modal";
  editBtn.addEventListener("click", () => {
    setupTaskEdit(task)
    setupSaveBtn(task, title, description);
  });
}

export function createTaskElement(task: Task) {
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!incompleteDiv || !completeDiv) {
    throw new Error("Dashboard not loaded yet");
  }

  const taskDiv = document.createElement("div");
  taskDiv.classList = "task";
  taskDiv.dataset.taskId = String(task.id);

  const check = document.createElement("input");
  check.checked = task.complete;
  setupCheckBox(check, task, taskDiv, incompleteDiv, completeDiv);

  const buttonDiv = document.createElement("div");
  buttonDiv.id = "task-buttons";

  const delBtn = document.createElement("button");
  setupDelBtn(delBtn, task, taskDiv);

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "task-body";

  const title = document.createElement("h2");
  title.textContent = task.title;

  const description = document.createElement("p");

  const editBtn = document.createElement("button");
  setupEditBtn(editBtn, task, title, description);

  buttonDiv.append(delBtn, editBtn);

  if (task.description) {
    description.textContent = task.description;
    bodyDiv.append(title, description, check);
    taskDiv.append(bodyDiv, buttonDiv);
  }
  else {
    bodyDiv.append(title, check);
    taskDiv.append(bodyDiv, buttonDiv);
  }

  (task.complete ? completeDiv! : incompleteDiv!).appendChild(taskDiv);
}

async function patchTask(task: Task, title: string, description?: string) {
  const res = await authFetch(`http://localhost:3000/user/tasks/${task.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
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
  const res = await authFetch("http://localhost:3000/user/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      description: description
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

function setupCreateBtn() {
  const form = document.querySelector("#task-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#create-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const title = form.querySelector<HTMLTextAreaElement>(".task-title");
      const description = form.querySelector<HTMLTextAreaElement>(".task-description");
      const task = await createTask(title!.value, description!.value);

      createTaskElement({ id: task.id, title: task.title, description: task.description } as Task);
    }
    catch (e) {
      err!.textContent = (e as Error).message;
      err!.classList.add("active");
      console.error(e);
    }
  });
}

function setupSignOutBtn() {
  const refreshToken = localStorage.getItem("refreshToken");
  const signOutBtn = document.querySelector<HTMLButtonElement>("#sign-out");

  signOutBtn!.addEventListener("mouseup", async () => {
    try {
      await authFetch("http://localhost:3000/logout", {
        method: "DELETE",
        body: JSON.stringify({
          rerfeshToken: refreshToken
        })
      });

      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      changeState("register");
    }
    catch (e) {
      console.error(e);
    }
  });
}

export async function getTasks() {
  const res = await authFetch("http://localhost:3000/user/tasks", { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function setupTasks() {
  try {
    await displayTasks();
    setupCreateBtn()
    setupSignOutBtn();
    setupModals();
    setupTaskBtns();
  }
  catch (e) {
    console.error(e);
  }
}
