import type { Project } from "../types";
import { setupLogin, setupRegister } from "./authUtils";
import { setupDash } from "./dashUtils";
import { setupTasks } from "./taskUtils";

class RouteManager {
  #currentProject: number = -1;
  projectsMap = new Map<number, Project>;

  constructor() {
    window.addEventListener("popstate", () => this.#router());
  }

  #setProjectId(currentProject: number) {
    if (this.projectsMap.get(currentProject)) {
      this.#currentProject = currentProject;
    }
    else {
      throw new Error("Project ID has no associated project");
    }
  }

  getProjectId() {
    return this.#currentProject;
  }

  getCurrentProject() {
    return this.projectsMap.get(this.#currentProject);
  }

  #setState(state: string) {
    switch (state) {
      case "register": {
        setupRegister();
        break;
      }
      case "login": {
        setupLogin();
        break;
      }
      case "dashboard": {
        setupDash();
        break;
      }
      case "tasks": {
        if (this.#currentProject === -1) {
          throw new Error("Missing project id");
        }
        setupTasks();
        break;
      }
    }
  }

  #router() {
    const path = window.location.pathname;

    if (path === "/login") this.#setState("login");
    else if (path === "/dashboard") this.#setState("dashboard");
    else if (path.startsWith("/project/")) {
      const projectId = Number(path.split("/")[2]);

      this.#setProjectId(projectId);
      this.#setState("tasks");
    }
    else this.#setState("register");
  }

  route(path: string) {
    history.pushState({}, "", path);
    this.#router();
  }
}

export const routeManager = new RouteManager();
