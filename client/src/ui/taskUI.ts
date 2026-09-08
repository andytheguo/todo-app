import type { Project } from "../types";

const app = document.querySelector<HTMLDivElement>("#app");

export async function displayTasks(project: Project) {
  if (!app) return;

  app.innerHTML = `
    <div id="taskboard">
      <div id="taskboard-header">
        <h1>Tasks | Project | ${project.name}</h1>

        <div class="right-panel">
          <button data-modal-target="#task-modal" id="add-button">Add Task</button>
          <button class="sign-out">Sign out</button>
          <button class="home-btn">Home</button>
        </div>
      </div>
      <div id="tasks" class="action">
        <div class="task-list">
          <h2>In Progress</h2>
          <div id="incomplete-tasks"></div>
        </div>
        <div class="task-list">
          <h2>Completed</h2>
          <div id="complete-tasks"></div>
        </div>
      </div>
    </div>
    <div class="modal" id="task-modal">
      <div class="modal-header">
        <h1>New Task</h1>
        <button data-close-button>&times;</button>
      </div>
      <form class="modal-body">
        <textarea class="modal-title" placeholder="Title"></textarea>
        <textarea class="modal-description" placeholder="Description..."></textarea>
        <button type="submit" id="create-button">Create Task</button>
        <p class="error" id="create-error">
      </form>
    </div>
    <div class="modal" id="edit-modal">
      <div class="modal-header">
        <h1>Edit Task</h1>
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
}
