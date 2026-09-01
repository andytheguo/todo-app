import { setupLogin, setupRegister } from "./authUtils";
import { setupDash } from "./dashUtils";
import { setupTasks } from "./taskUtils";

export function changeState(state: string, projectId?: number) {
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
      if (!projectId) {
        throw new Error("Missing project id");
      }
      setupTasks(projectId);
      break;
    }
  }
}
