document.addEventListener("DOMContentLoaded", function () {
  var signupFormInner = document.getElementById("signupFormInner");

  signupFormInner.addEventListener("submit", function (event) {
    event.preventDefault();

    var formData = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value,
    };

    fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Signup successful! You can now log in.");

        window.location.href = "/login.html";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error during signup. Please try again.");
      });
  });
});
