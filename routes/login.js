document.addEventListener("DOMContentLoaded", function () {
  var loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var formData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      };

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            console.log("Token received:", data.token);
            localStorage.setItem("token", data.token);
            window.location.href = "/expensetracker";
          } else if (data.error === "User not found") {
            alert("404!! User not found. Please check your credentials.");
          } else {
            alert("Invalid credentials. Please check your email and password.");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  } else {
    console.error("Element with ID 'loginForm' not found.");
  }
});