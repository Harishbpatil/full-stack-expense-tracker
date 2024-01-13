document.addEventListener("DOMContentLoaded", function () {
  var signupBtn = document.getElementById("signupBtn");
  var signupModal = document.getElementById("signupModal");
  var signupFormInner = document.getElementById("signupFormInner");

  signupBtn.addEventListener("click", function () {
    signupModal.style.display = "block";
  });

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
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    signupModal.style.display = "none";
  });
});
