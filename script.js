const email = "marom.yahav1@gmail.com";
const status = document.getElementById("status");

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("copy").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(email);
    status.textContent = "Email copied.";
  } catch {
    status.textContent = "Couldn't copy automatically. My email is " + email;
  }
});
