document.addEventListener("DOMContentLoaded", function () {
  var loginBtn = document.getElementById("loginBtn");

  loginBtn.addEventListener("click", async function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);

        window.location.href = "/expensetracker.html";
      } else {
        const errorData = await response.json();
        console.error("Login failed. Response:", errorData);
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  });
});
