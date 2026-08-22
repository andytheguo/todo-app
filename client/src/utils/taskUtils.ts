import type { Task } from "../types";
import { changeState } from "./stateManager";
import { displayTasks } from "../ui/taskUI";
import { setupModals } from "./modalUtils";
import { authFetch } from "./authUtils";

async function updateTask(task: Task, complete: boolean) {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`http://localhost:3000/user/tasks/${task.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
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

  editTitle.textContent = task.title;

  if (task.description) editDesciption.textContent = task.description;
}

function setupSaveBtn(task: Task, saveButton: HTMLButtonElement, title: HTMLHeadElement, description: HTMLParagraphElement) {
  try {
    saveButton.addEventListener("mouseup", async () => {
      const editTitle = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-title");
      const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .task-description");
      await patchTask(task, editTitle!.value, editDesciption!.value);

      task.title = editTitle!.value;
      task.description = editDesciption!.value;

      title.textContent = task.title;
      description.textContent = task.description;
    });
  }
  catch (e) {
    console.error(e);
  }
}

export function createTaskDiv(task: Task) {
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  const taskDiv = document.createElement("div");
  taskDiv.classList = "task";

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = task.complete;
  check.addEventListener("change", async () => {
    // TODO: Potential bug?
    await updateTask(task, check.checked);

    const dest = check.checked ? completeDiv : incompleteDiv;
    dest!.appendChild(taskDiv);
  });

  const delBtn = document.createElement("button");
  delBtn.textContent = "DELETE";
  delBtn.id = "delete-btn";
  delBtn.addEventListener("mouseup", async () => {
    await setupTaskDelete(task)
    taskDiv.remove();
  });

  const title = document.createElement("h2");
  title.textContent = task.title;

  const description = document.createElement("p");

  const saveBtn = document.querySelector<HTMLButtonElement>("#save-button");
  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.id = "edit-btn";
  editBtn.dataset.modalTarget = "#edit-modal";
  editBtn.addEventListener("mouseup", () => {
    // TODO: Optimise this
    setupTaskEdit(task)
    setupSaveBtn(task, saveBtn!, title, description);
  });

  if (task.description) {
    description.textContent = task.description;
    taskDiv.append(check, title, description, delBtn, editBtn);
  }
  else {
    taskDiv.append(check, title, delBtn, editBtn);
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

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

function setupCreateBtn() {
  const createButton = document.querySelector<HTMLButtonElement>("#create-button");

  createButton!.addEventListener("mouseup", async () => {
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
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error("No access token");
  }

  const res = await authFetch("http://localhost:3000/user/tasks", { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  // TODO: remove this
  console.log(data);

  return data;
}

export async function setupTasks() {
  try {
    await displayTasks();
    setupCreateBtn()
    setupSignOutBtn();
    setupModals();
  }
  catch (e) {
    console.error(e);
  }
}
