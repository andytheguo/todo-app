import { getTasks, createTaskElement } from "../utils/taskUtils";

const app = document.querySelector<HTMLDivElement>("#app");

export async function displayTasks(projectId: number) {
  if (!app) return;

  app.innerHTML = `
    <div id="taskboard">
      <div id="taskboard-header">
        <h1>Tasks</h1>
        <button data-modal-target="#task-modal" id="add-button">Add Task</button>
        <button class="sign-out">Sign out</button>
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
      <form class="modal-body">
        <textarea class="task-title" placeholder="Title"></textarea>
        <textarea class="task-description" placeholder="Description..."></textarea>
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
        <textarea class="task-title"></textarea>
        <textarea class="task-description"></textarea>
        <button type="submit" id="save-button">Save</button>
        <p class="error" id="save-error">
      </form>
    </div>
    <div id="overlay"></div>
    `;

  const tasks = await getTasks(projectId);

  for (const task of tasks) {
    createTaskElement(task);
  }
}
