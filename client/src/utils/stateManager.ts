import type { Project } from "../types";
import { setupLogin, setupRegister } from "./authUtils";
import { setupDash } from "./dashUtils";
import { setupTasks } from "./taskUtils";

export function changeState(state: string, project?: Project) {
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
      if (!project) {
        throw new Error("Missing project id");
      }
      setupTasks(project);
      break;
    }
  }
}
