import { getTasks, createTaskDiv } from "../utils/taskUtils";

const app = document.querySelector<HTMLDivElement>("#app");

export async function displayTasks() {
  if (!app) return;

  app.innerHTML = `
    <div id="tasks-header">
      <h1>Tasks</h1>
      <button data-modal-target="#task-modal" id="add-button">Add Task</button>
    </div>
    <div id="tasks">
      <div id="incomplete-tasks">
        <h2>In Progress</h2>
      </div>
      <div id="complete-tasks">
        <h2>Completed</h2>
      </div>
    </div>
    <div class="modal" id="task-modal">
      <div class="modal-header">
        <h1>New Task</h1>
        <button data-close-button>&times;</button>
      </div>
      <div class="modal-body">
        <textarea class="task-title">Title</textarea>
        <textarea class="task-description">Description...</textarea>
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
  const incompleteDiv = document.querySelector<HTMLDivElement>("#incomplete-tasks");
  const completeDiv = document.querySelector<HTMLDivElement>("#complete-tasks");

  for (const task of tasks) {
    const taskDiv = createTaskDiv(task);
    (task.complete ? completeDiv! : incompleteDiv!).appendChild(taskDiv);
  }
}
