import type { Project } from "../types";
import { displayDash } from "../ui/dashUI";
import { authFetch, setupSignOutBtn } from "./authUtils";
import { setupActionBtns, setupModals } from "./modalUtils";
import { changeState } from "./stateManager";

export async function getProjects() {
  const res = await authFetch("http://localhost:3000/projects", { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

async function patchProject(project: Project, name: string, description?: string) {
  const res = await authFetch(`http://localhost:3000/projects/${project.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: description
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

async function setupProjectDelete(project: Project) {
  try {
    const res = await authFetch(`http://localhost:3000/projects/${project.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  }
  catch (e) {
    console.error(e);
  }
}

function setupProjectDelBtn(delBtn: HTMLButtonElement, project: Project, taskDiv: HTMLDivElement) {
  delBtn.textContent = "DELETE";
  delBtn.classList = "delete-btn";
  delBtn.addEventListener("mouseup", async () => {
    await setupProjectDelete(project);
    taskDiv.remove();
  });
}

function setupProjectEdit(project: Project) {
  const editName = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-title");
  const editDesciption = document.querySelector<HTMLTextAreaElement>("#edit-modal .modal-description");

  if (!editName || !editDesciption) {
    throw new Error("Edit modal has not loaded yet");
  }

  editName.textContent = project.name;

  if (project.description) editDesciption.textContent = project.description;
}

function setupProjectSaveBtn(project: Project, name: HTMLHeadElement, description: HTMLParagraphElement) {
  const form = document.querySelector<HTMLFormElement>("#edit-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#save-error");

  if (!form) return;

  form.onsubmit = async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const editName = form.querySelector<HTMLTextAreaElement>(".modal-title");
      const editDesciption = form.querySelector<HTMLTextAreaElement>(".modal-description");
      await patchProject(project, editName!.value, editDesciption!.value);

      project.name = editName!.value;
      project.description = editDesciption!.value;

      name.textContent = project.name;
      description.textContent = project.description;
    }
    catch (e) {
      err!.textContent = (e as Error).message;
      err!.classList.add("active");
      console.error(e);
    }
  }
}

function setupProjectEditBtn(editBtn: HTMLButtonElement, project: Project, name: HTMLHeadElement, description: HTMLParagraphElement) {
  editBtn.dataset.modalTarget = "#edit-modal";
  editBtn.addEventListener("mouseup", () => {
    setupProjectEdit(project);
    setupProjectSaveBtn(project, name, description);
  });
}

export function createProjectElement(project: Project) {
  const projectsDiv = document.querySelector<HTMLDivElement>("#projects");

  if (!projectsDiv) {
    throw new Error("Dashboard has not loaded yet");
  }

  const projectDiv = document.createElement("div");
  projectDiv.classList = "project";

  projectDiv.addEventListener("mouseup", (event) => {
    const eventTarget = event.target as HTMLElement;

    if (eventTarget.closest(".action-buttons")) return;
    changeState("tasks", project);
  });

  // TODO: progress div

  const progressDiv = document.createElement("div");
  progressDiv.classList = "progress"

  const progress = document.createElement("div");
  progress.classList = "progress-container";

  const progressPercent = project.total == 0 ? 0 : Math.round((project.completed / project.total) * 100);

  const progressBar = document.createElement("div");
  progressBar.classList = "progress-bar";
  progressBar.style.width = `${progressPercent}%`;

  const progressTxt = document.createElement("p");
  progressTxt.textContent = progressPercent == 100 ? "DONE" : `${progressPercent}%`

  progress.append(progressBar);

  progressDiv.append(progress, progressTxt);

  const buttonDiv = document.createElement("div");
  buttonDiv.classList = "action-buttons";

  const delBtn = document.createElement("button");
  setupProjectDelBtn(delBtn, project, projectDiv);

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "project-body";

  const name = document.createElement("h2");
  name.textContent = project.name;

  const description = document.createElement("p");

  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.classList = "edit-btn";
  setupProjectEditBtn(editBtn, project, name, description);

  buttonDiv.append(delBtn, editBtn);

  if (project.description) {
    description.textContent = project.description;
    bodyDiv.append(name, description);
  }
  else {
    bodyDiv.append(name, buttonDiv);
  }

  projectDiv.append(bodyDiv, progressDiv, buttonDiv);

  projectsDiv.append(projectDiv);
}

async function createProject(name: string, description: string) {
  const res = await authFetch(`http://localhost:3000/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      description: description
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

function setupNewProjectBtn() {
  const form = document.querySelector<HTMLFormElement>("#project-modal .modal-body");
  const err = document.querySelector<HTMLParagraphElement>("#create-error");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      err!.classList.remove("active");
      const name = form.querySelector<HTMLTextAreaElement>(".modal-title");
      const description = form.querySelector<HTMLTextAreaElement>(".modal-description");
      const project = await createProject(name!.value, description!.value);

      createProjectElement({ id: project.id, name: project.name, description: project.description } as Project);

      form.reset();
    }
    catch (e) {
      err!.textContent = (e as Error).message;
      err!.classList.add("active");
      console.error(e);
    }
  });
}

export async function setupDash() {
  await displayDash();
  setupNewProjectBtn();
  setupSignOutBtn();
  setupModals();
  setupActionBtns();
}
