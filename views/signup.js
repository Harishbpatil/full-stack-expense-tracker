document.addEventListener("DOMContentLoaded", function () {
  var signupBtn = document.getElementById("signupBtn");
  var signupModal = document.getElementById("signupModal");
  var closeModalBtn = document.getElementById("closeModalBtn");
  var signupFormInner = document.getElementById("signupFormInner");

  signupBtn.addEventListener("click", function () {
    signupModal.style.display = "block";
  });

  closeModalBtn.addEventListener("click", function () {
    signupModal.style.display = "none";
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
