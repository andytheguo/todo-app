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

async function patchProject(projectId: number, options: {
  name: string,
  description?: string
}) {
  const res = await authFetch(`http://localhost:3000/projects/${projectId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: options.name,
      description: options.description
    })
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
}

function setupProjectDelBtns() {
  const projects = document.querySelector<HTMLDivElement>("#projects");

  if (!projects) {
    throw new Error("Dashboard has not loaded yet");
  }

  projects.addEventListener("mouseup", async (event) => {
    if (event.button !== 0) return;

    const eventTarget = event.target as HTMLElement;

    const button = eventTarget.closest<HTMLButtonElement>(".delete-btn");

    if (!button) return;

    const projectDiv = eventTarget.closest<HTMLDivElement>(".project");

    if (!projectDiv) return;
    const projectId = projectDiv.dataset.projectId;

    await deleteProject(Number(projectId));
    projectDiv.remove();
  });
}

async function deleteProject(projectId: number) {
  try {
    const res = await authFetch(`http://localhost:3000/projects/${projectId}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  }
  catch (e) {
    console.error(e);
  }
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
      await patchProject(project.id, {
        name: editName!.value,
        description: editDesciption!.value
      });

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
  projectDiv.dataset.projectId = String(project.id);

  projectDiv.addEventListener("mouseup", (event) => {
    const eventTarget = event.target as HTMLElement;

    if (eventTarget.closest(".action-buttons")) return;
    changeState("tasks", project);
  });

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
  delBtn.textContent = "DELETE";
  delBtn.classList = "delete-btn";

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "project-body";

  const name = document.createElement("h2");
  name.textContent = project.name;

  const description = document.createElement("p");

  const editBtn = document.createElement("button");
  editBtn.textContent = "EDIT";
  editBtn.classList = "edit-btn";
  editBtn.dataset.modalTarget = "#edit-modal";
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

      createProjectElement(project);

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
  setupProjectDelBtns();
}
