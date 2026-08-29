import { setupLogin, setupRegister } from "./authUtils";
import { setupDash } from "./dashUtils";
import { setupTasks } from "./taskUtils";

export function changeState(state: string) {
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
      setupTasks();
      break;
    }
  }
}
