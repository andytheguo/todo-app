import type { Project, Task } from "../types";
import { changeState } from "./stateManager";
import { displayTasks } from "../ui/taskUI";
import { setupModals, setupActionBtns, updateEditModal } from "./modalUtils";
import { authFetch, setupSignOutBtn } from "./authUtils";

const tasksMap = new Map<number, Task>;

async function reorderTasks(projectId: number, incomplete: number[], complete: number[]) {
  const res = await authFetch(`http://localhost:3000/projects/${projectId}/tasks/reorder`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ incomplete, complete })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

async function deleteTask(taskId: number) {
  const res = await authFetch(`http://localhost:3000/tasks/${taskId}`, { method: "DELETE" });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

async function getTasks(projectId: number) {
  const res = await authFetch(`http://localhost:3000/projects/${projectId}/tasks`, { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

async function patchTask(taskId: number, options: {
  title?: string,
  description?: string,
  complete?: boolean
}) {
  const res = await authFetch(`http://localhost:3000/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: options.title,
      description: options.description,
      complete: options.complete
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

async function setTaskOrder(projectId: number) {
  const incompleteTasks = document.querySelectorAll<HTMLDivElement>("#incomplete-tasks .task");
  const completeTasks = document.querySelectorAll<HTMLDivElement>("#complete-tasks .task");

  const incomplete = Array.from(incompleteTasks).map(taskDiv => Number(taskDiv.dataset.taskId));
  const complete = Array.from(completeTasks).map(taskDiv => Number(taskDiv.dataset.taskId));

  await reorderTasks(projectId, incomplete, complete)
}

function updateTaskSave(task: Task, title: HTMLHeadElement, description: HTMLParagraphElement) {
  const form = document.querySelector<HTMLFormElement>("#edit-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#save-error");

  if (!form) return;

  form.onsubmit = async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const editTitle = form.querySelector<HTMLTextAreaElement>(".modal-title");
      const editDesciption = form.querySelector<HTMLTextAreaElement>(".modal-description");

      await patchTask(task.id, {
        title: editTitle!.value,
        description: editDesciption!.value
      });

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

function setupCheckBoxes() {
  const tasksDiv = document.querySelector<HTMLDivElement>("#tasks");
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!tasksDiv || !incompleteDiv || !completeDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  tasksDiv.addEventListener("change", async (event) => {
    const eventTarget = event.target as HTMLElement;

    const checkbox = eventTarget.closest<HTMLInputElement>("input");

    if (!checkbox) return;

    const taskDiv = eventTarget.closest<HTMLDivElement>(".task");

    if (!taskDiv) return;
    const taskId = taskDiv.dataset.taskId;

    const task = tasksMap.get(Number(taskId));

    if (!task) {
      throw new Error("Task not found");
    }

    await patchTask(task.id, {
      complete: checkbox.checked
    });

    task.complete = checkbox.checked;

    (checkbox.checked ? completeDiv : incompleteDiv).append(taskDiv);
  });
}

function setupTaskDelBtns() {
  const tasksDiv = document.querySelector<HTMLDivElement>("#tasks");

  if (!tasksDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  tasksDiv.addEventListener("mouseup", async (event) => {
    if (event.button !== 0) return;

    const eventTarget = event.target as HTMLElement;

    const button = eventTarget.closest<HTMLButtonElement>(".delete-btn");

    if (!button) return;

    const taskDiv = eventTarget.closest<HTMLDivElement>(".task");

    if (!taskDiv) return;
    const taskId = taskDiv.dataset.taskId;

    await deleteTask(Number(taskId));
    taskDiv.remove();
  });
}

function setupTaskEditBtns() {
  const tasksDiv = document.querySelector<HTMLDivElement>("#tasks");

  if (!tasksDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  tasksDiv.addEventListener("mouseup", async (event) => {
    if (event.button !== 0) return;

    const eventTarget = event.target as HTMLElement;

    const button = eventTarget.closest<HTMLButtonElement>(".edit-btn");

    if (!button) return;

    const taskDiv = eventTarget.closest<HTMLDivElement>(".task");

    if (!taskDiv) return;
    const taskId = taskDiv.dataset.taskId;

    const task = tasksMap.get(Number(taskId));

    if (!task) {
      throw new Error("Task not found");
    }

    const title = taskDiv.querySelector<HTMLHeadingElement>("#task-body h2");
    const description = taskDiv.querySelector<HTMLParagraphElement>("#task-body p");

    updateEditModal(task.title, task.description);
    updateTaskSave(task, title!, description!);
  });
}

function makePlaceholder(height: number) {
  const placeholder = document.createElement("div");
  placeholder.classList.add("placeholder");
  placeholder.style.height = `${height}px`;

  return placeholder;
}

function getInsertion(event: DragEvent) {
  const target = document.elementFromPoint(event.clientX, event.clientY) as HTMLElement;

  if (!target) return undefined;
  const task = target.closest<HTMLDivElement>(".task");

  if (!task) return undefined;
  const taskRect = task.getBoundingClientRect();

  const mid = (taskRect.top + taskRect.bottom) / 2;

  if (event.clientY <= mid) {
    return task;
  }
  else {
    return task.nextSibling;
  }
}

function movePlaceholder(container: HTMLDivElement, placeholder: HTMLDivElement, event: DragEvent) {
  const lastTask = container.lastElementChild;

  if (!lastTask || event.clientY >= lastTask.getBoundingClientRect().bottom) {
    container.append(placeholder);
    return;
  }

  const element = getInsertion(event);

  if (element === undefined) return;
  container.insertBefore(placeholder, element);
}

function setupTaskDrag() {
  const tasksDiv = document.querySelector<HTMLDivElement>("#tasks");
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!tasksDiv || !incompleteDiv || !completeDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  let draggedTask: HTMLDivElement | null;
  let placeholderTask: HTMLDivElement | null;

  tasksDiv.addEventListener("dragstart", (event) => {
    const eventTarget = event.target as HTMLElement;

    const taskDiv = eventTarget.closest<HTMLDivElement>(".task");

    if (!taskDiv) return;
    draggedTask = taskDiv;

    const placeholder = makePlaceholder(taskDiv.offsetHeight);
    placeholderTask = placeholder;
    taskDiv.classList.add("dragging");

    taskDiv.parentElement!.insertBefore(placeholder, taskDiv);
  });

  tasksDiv.addEventListener("dragend", async () => {
    if (!draggedTask || !placeholderTask) return;
    draggedTask.classList.remove("dragging");

    try {
      const check = draggedTask.querySelector<HTMLInputElement>("#task-body input");
      if (!check) return;

      const container = placeholderTask.parentElement;

      if (!container) return;

      const complete = container === completeDiv;

      check.checked = complete;
      const taskId = Number(draggedTask.dataset.taskId);
      await patchTask(taskId, { complete: complete });

      placeholderTask.replaceWith(draggedTask);

      const task = tasksMap.get(taskId);

      if (!task) {
        throw new Error("Task not found");
      }


      await setTaskOrder(task.projectId);
    }
    catch (e) {
      console.error(e);
    }

    placeholderTask = null;
    draggedTask = null;
  });

  incompleteDiv.ondragover = (event) => {
    event.preventDefault();

    if (!placeholderTask) return;
    movePlaceholder(incompleteDiv, placeholderTask, event);
  };

  completeDiv.ondragover = (event) => {
    event.preventDefault();

    if (!placeholderTask) return;
    movePlaceholder(completeDiv, placeholderTask, event);
  };
}

function createTaskElement(task: Task) {
  tasksMap.set(task.id, task);

  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  if (!incompleteDiv || !completeDiv) {
    throw new Error("Taskboard has not loaded yet");
  }

  const taskDiv = document.createElement("div");
  taskDiv.classList = "task";
  taskDiv.draggable = true;
  taskDiv.dataset.taskId = String(task.id);

  const check = document.createElement("input");
  check.checked = task.complete;
  check.type = "checkbox";

  const buttonDiv = document.createElement("div");
  buttonDiv.classList = "action-buttons";

  const delBtn = document.createElement("button");
  delBtn.textContent = "DELETE";
  delBtn.classList = "delete-btn";

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "task-body";

  const title = document.createElement("h2");
  title.textContent = task.title;

  const description = document.createElement("p");

  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.classList = "edit-btn";
  editBtn.dataset.modalTarget = "#edit-modal";

  buttonDiv.append(delBtn, editBtn);

  description.textContent = task.description ?? "";
  bodyDiv.append(title, description, check);

  taskDiv.append(bodyDiv, buttonDiv);

  (task.complete ? completeDiv : incompleteDiv).appendChild(taskDiv);
}

async function createTask(projectId: number, options: {
  title: string,
  description?: string
}) {
  const res = await authFetch(`http://localhost:3000/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: options.title,
      description: options.description
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
      const task = await createTask(project.id, {
        title: title!.value,
        description: description!.value
      });

      createTaskElement(task);

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

async function setupTaskElements(project: Project) {
  const tasks = await getTasks(project.id);

  for (const task of tasks) {
    createTaskElement(task);
  }
}

export async function setupTasks(project: Project) {
  try {
    displayTasks(project);
    await setupTaskElements(project);
    setupCreateTaskBtn(project);
    setupSignOutBtn();
    setupHomeBtn();
    setupModals();
    setupActionBtns();
    setupTaskDrag();
    setupTaskDelBtns();
    setupTaskEditBtns();
    setupCheckBoxes();
  }
  catch (e) {
    console.error(e);
  }
}
