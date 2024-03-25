document.addEventListener("DOMContentLoaded", function () {
  // Add an event listener to the login form for submission
  var loginForm = document.getElementById("login");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        // Prepare user login data from the form
        const formData = {
          email: document.getElementById("email").value,
          password: document.getElementById("password").value,
        };

        // Make a POST request to the server to login the user
        const response = await axios.post(
          "http://localhost:4000/user/login",
          formData
        );

        // Check if login was successful (status code 200)
        if (response.status === 200) {
          // Extract the token from the response
          const token = response.data.token;

          // Store the token in the localStorage
          localStorage.setItem("token", token);

          // Redirect the user to the expensetracker page
          window.location.href = "/expensetracker"; // Redirect to expensetracker page
        } else {
          // Display an error message if login was unsuccessful
          alert("Login failed. Please check your credentials and try again.");
        }
      } catch (error) {
        // Handle errors and display appropriate messages
        console.error("An error occurred during login:", error);

        // Check if the error is due to unauthorized access (status code 401)
        if (error.response && error.response.status === 401) {
          alert("Incorrect email or password. Please try again.");
        } else {
          alert("An unexpected error occurred. Please try again later.");
        }
      }
    });
  } else {
    console.error("Element with ID 'login' not found.");
  }
});
