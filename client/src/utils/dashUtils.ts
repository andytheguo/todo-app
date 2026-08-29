import { displayDash } from "../ui/dashUI";

function onProject() {
  console.log("HI");
}

export async function setupDash() {
  displayDash();
  onProject();
}
