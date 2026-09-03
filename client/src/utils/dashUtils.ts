import type { Project } from "../types";
import { displayDash } from "../ui/dashUI";
import { authFetch, setupSignOutBtn } from "./authUtils";
import { changeState } from "./stateManager";

export async function getProjects() {
  const res = await authFetch("http://localhost:3000/projects", { method: "GET" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

export function createProjectElement(project: Project) {
  const projectsDiv = document.querySelector<HTMLDivElement>("#projects");

  if (!projectsDiv) {
    throw new Error("Dashboard has not loaded yet");
  }

  const projectDiv = document.createElement("div");
  projectDiv.classList = "project";

  projectDiv.addEventListener("mouseup", () => {
    changeState("tasks", project.id);
  });

  const bodyDiv = document.createElement("div");
  bodyDiv.id = "project-body";

  const name = document.createElement("h2");
  name.textContent = project.name;

  const description = document.createElement("p");

  if (project.description) {
    description.textContent = project.description;
    bodyDiv.append(name, description);
  }
  else {
    bodyDiv.append(name);
  }

  projectDiv.append(bodyDiv);

  projectsDiv.append(projectDiv);
}

export async function setupDash() {
  await displayDash();
  setupSignOutBtn();
}
