import type { Project, Task } from "../types";
import { changeState } from "./stateManager";
import { displayTasks } from "../ui/taskUI";
import { setupModals, setupActionBtns } from "./modalUtils";
import { authFetch, setupSignOutBtn } from "./authUtils";

async function updateTask(taskId: number, complete: boolean) {
  try {
    const res = await authFetch(`http://localhost:3000/tasks/${taskId}`, {
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
  }
  catch (e) {
    console.error(e);
  }
}

async function setupTaskDelete(task: Task) {
  try {
    const res = await authFetch(`http://localhost:3000/tasks/${task.id}`, { method: "DELETE" });

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
  const editTitle = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-title");
  const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-description");

  if (!editTitle || !editDesciption) {
    throw new Error("Edit modal has not loaded yet");
  }

  editTitle.textContent = task.title;

  if (task.description) editDesciption.textContent = task.description;
}

function setupTaskSaveBtn(task: Task, title: HTMLHeadElement, description: HTMLParagraphElement) {
  const form = document.querySelector<HTMLFormElement>("#edit-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#save-error");

  if (!form) return;

  form.onsubmit = async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const editTitle = form.querySelector<HTMLTextAreaElement>(".modal-title");
      const editDesciption = form.querySelector<HTMLTextAreaElement>(".modal-description");
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
    await updateTask(task.id, check.checked);
    task.complete = check.checked;

    const dest = check.checked ? completeDiv : incompleteDiv;
    dest.appendChild(taskDiv);
  });
}

function setupTaskDelBtn(delBtn: HTMLButtonElement, task: Task, taskDiv: HTMLDivElement) {
  delBtn.textContent = "DELETE";
  delBtn.classList = "delete-btn";
  delBtn.addEventListener("mouseup", async () => {
    await setupTaskDelete(task);
    taskDiv.remove();
  });
}

function setupTaskEditBtn(editBtn: HTMLButtonElement, task: Task, title: HTMLHeadElement, description: HTMLParagraphElement) {
  editBtn.dataset.modalTarget = "#edit-modal";
  editBtn.addEventListener("mouseup", () => {
    setupTaskEdit(task)
    setupTaskSaveBtn(task, title, description);
  });
}

function setupTaskDrag() {
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!incompleteDiv || !completeDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  incompleteDiv.ondragover = (event) => {
    event.preventDefault();
  };

  completeDiv.ondragover = (event) => {
    event.preventDefault();
  };

  incompleteDiv.ondrop = async (event) => {
    event.preventDefault();

    try {
      const taskDiv = document.querySelector<HTMLDivElement>(".dragging");
      if (!taskDiv) return;

      const check = taskDiv.querySelector<HTMLInputElement>("#task-body input");
      if (!check) return;

      check.checked = false;
      await updateTask(Number(taskDiv.dataset.taskId), check.checked);

      incompleteDiv.append(taskDiv);
    }
    catch (e) {
      console.error(e);
    }
  };

  completeDiv.ondrop = async (event) => {
    event.preventDefault();

    try {
      const taskDiv = document.querySelector<HTMLDivElement>(".dragging");
      if (!taskDiv) return;

      const check = taskDiv.querySelector<HTMLInputElement>("#task-body input");
      if (!check) return;

      check.checked = true;
      await updateTask(Number(taskDiv.dataset.taskId), check.checked);

      completeDiv.append(taskDiv);
    }
    catch (e) {
      console.error(e);
    }
  };
}

export function createTaskElement(task: Task) {
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!incompleteDiv || !completeDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  const taskDiv = document.createElement("div");
  taskDiv.classList = "task";
  taskDiv.draggable = true;
  taskDiv.dataset.taskId = String(task.id);

  taskDiv.addEventListener("dragstart", () => {
    taskDiv.classList.add("dragging");
  });

  taskDiv.addEventListener("dragend", () => {
    taskDiv.classList.remove("dragging");
  });

  const check = document.createElement("input");
  check.checked = task.complete;
  setupCheckBox(check, task, taskDiv, incompleteDiv, completeDiv);

  const buttonDiv = document.createElement("div");
  buttonDiv.classList = "action-buttons";

  const delBtn = document.createElement("button");
  setupTaskDelBtn(delBtn, task, taskDiv);

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "task-body";

  const title = document.createElement("h2");
  title.textContent = task.title;

  const description = document.createElement("p");

  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.classList = "edit-btn";
  setupTaskEditBtn(editBtn, task, title, description);

  buttonDiv.append(delBtn, editBtn);

  if (task.description) {
    description.textContent = task.description;
    bodyDiv.append(title, description, check);
  }
  else {
    bodyDiv.append(title, check);
  }

  taskDiv.append(bodyDiv, buttonDiv);

  (task.complete ? completeDiv : incompleteDiv).appendChild(taskDiv);
}

async function patchTask(task: Task, title: string, description?: string) {
  const res = await authFetch(`http://localhost:3000/tasks/${task.id}`, {
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

async function createTask(project: Project, title: string, description?: string) {
  const res = await authFetch(`http://localhost:3000/projects/${project.id}/tasks`, {
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

function setupCreateTaskBtn(project: Project) {
  const form = document.querySelector<HTMLFormElement>("#task-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#create-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const title = form.querySelector<HTMLTextAreaElement>(".modal-title");
      const description = form.querySelector<HTMLTextAreaElement>(".modal-description");
      const task = await createTask(project, title!.value, description!.value);

      createTaskElement({ id: task.id, title: task.title, description: task.description } as Task);

      form.reset();
    }
    catch (e) {
      err!.textContent = (e as Error).message;
      err!.classList.add("active");
      console.error(e);
    }
  });
}

function setupHomeBtn() {
  const homeBtn = document.querySelector<HTMLButtonElement>(".home-btn");
  homeBtn!.addEventListener("mouseup", () => changeState("dashboard"));
}

export async function getTasks(project: Project) {
  const res = await authFetch(`http://localhost:3000/projects/${project.id}/tasks`, { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export async function setupTasks(project: Project) {
  try {
    await displayTasks(project);
    setupCreateTaskBtn(project);
    setupSignOutBtn();
    setupHomeBtn();
    setupModals();
    setupActionBtns();
    setupTaskDrag();
  }
  catch (e) {
    console.error(e);
  }
}
