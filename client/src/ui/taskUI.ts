import { getTasks, createTaskDiv } from "../utils/taskUtils";

const app = document.querySelector<HTMLDivElement>("#app");

export async function displayTasks() {
  if (!app) return;

  app.innerHTML = `
    <div class="dashboard">
      <div id="tasks-header">
        <h1>Tasks</h1>
        <button data-modal-target="#task-modal" id="add-button">Add Task</button>
        <button id="sign-out">Sign out</button>
      </div>
      <div id="tasks">
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
      <div class="modal-body">
        <textarea class="task-title" placeholder="Title"></textarea>
        <textarea class="task-description" placeholder="Description..."></textarea>
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

  for (const task of tasks) {
    createTaskDiv(task);
  }
}
