import "./styles/dashboard.css";
import "./styles/global.css";
import "./styles/modal.css";
import "./styles/tasks.css";
import { changeState } from "./utils/stateManager";

// TODO:
// Handle errors better - don't just print them out to console
// Fix bug where edit modal doesnt open on newly created tasks
// Fix bug where edit modal allows empty title
changeState("register");
