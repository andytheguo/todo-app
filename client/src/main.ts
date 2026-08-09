const app = document.querySelector<HTMLDivElement>("#app");

async function test() {
  const res = await fetch("http://localhost:3000");

  console.log(res.status);
}

test();

if (app) {
  app.innerHTML = `
    <form id=login>
      <input type="text" placeholder="Email" required>
      <input type="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    `;
}
