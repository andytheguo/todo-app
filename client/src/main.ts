import "./styles.css";
import { changeState } from "./utils/stateManager";

// TODO:
// Handle errors better - don't just print them out to console
// Fix bug where create doesnt reset textContent
// Fix bug where edit doesnt work on newly created tasks
changeState("register");
