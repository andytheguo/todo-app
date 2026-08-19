import { setupLogin, setupRegister } from "./authUtils";
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
    case "tasks": {
      setupTasks();
      break;
    }
  }
}
