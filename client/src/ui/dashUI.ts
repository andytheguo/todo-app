const app = document.querySelector<HTMLDivElement>("#app");

export function displayDash() {
  if (!app) return;

  app.innerHTML = `
    <div id="dashboard">
      <div id="dashboard-header">
        <h1>Dashboard</h1>
        <button id="add-project">Create New Project</button>
        <button class="sign-out">Sign out</button>
      </div>
      <div id="projects">
        <div class="project"></div>
      </div>
    </div>
    `;
}
