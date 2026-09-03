import { createProjectElement, getProjects } from "../utils/dashUtils";

const app = document.querySelector<HTMLDivElement>("#app");

export async function displayDash() {
  if (!app) return;

  app.innerHTML = `
    <div id="dashboard">
      <div id="dashboard-header">
        <h1>Dashboard</h1>
        <button data-modal-target="#project-modal" id="create-project">New Project</button>
        <button class="sign-out">Sign out</button>
      </div>
      <div id="projects" class="action"></div>
    </div>
    <div class="modal" id="project-modal">
      <div class="modal-header">
        <h1>New Project</h1>
        <button data-close-button>&times;</button>
      </div>
      <form class="modal-body">
        <textarea class="modal-title" placeholder="Name"></textarea>
        <textarea class="modal-description" placeholder="Description..."></textarea>
        <button type="submit" id="create-button">Create Project</button>
        <p class="error" id="create-error">
      </form>
    </div>
    <div class="modal" id="edit-modal">
      <div class="modal-header">
        <h1>Edit Project</h1>
        <button data-close-button>&times;</button>
      </div>
      <form class="modal-body">
        <textarea class="modal-title"></textarea>
        <textarea class="modal-description"></textarea>
        <button type="submit" id="save-button">Save</button>
        <p class="error" id="save-error">
      </form>
    </div>
    <div id="overlay"></div>
    `;

  const projects = await getProjects();

  for (const project of projects) {
    createProjectElement(project);
  }
}
