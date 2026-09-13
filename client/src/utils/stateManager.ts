import type { Project } from "../types";
import { setupLogin, setupRegister } from "./authUtils";
import { setupDash } from "./dashUtils";
import { setupTasks } from "./taskUtils";

class StateManager {
  currentProject: number = -1;
  projectsMap = new Map<number, Project>;

  setProjectId(currentProject: number) {
    this.currentProject = currentProject;
  }

  getProjectId() {
    return this.currentProject;
  }

  getCurrentProject() {
    return this.projectsMap.get(this.currentProject);
  }

  setState(state: string) {
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
        if (this.currentProject === -1) {
          throw new Error("Missing project id");
        }
        setupTasks();
        break;
      }
    }
  }
}

export const stateManager = new StateManager();
