// Update the login.js file to handle login requests and display appropriate messages

// Add an event listener to the login form for submission
document.getElementById("login").addEventListener("submit", loginUser);

// Create an Axios instance with a base URL for user-related operations
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/user",
});

// Async function to handle user login
async function loginUser(e) {
  // Prevent the default form submission behavior
  e.preventDefault();

  try {
    // Prepare user login data from the form
    const data = {
      email: e.target.email.value,
      password: e.target.password.value,
    };

    // Make a POST request to the server to login the user
    const res = await axiosInstance.post("/login", data);

    // Log the response from the server
    console.log(res);

    // Check if login was successful (status code 200)
    if (res.status === 200) {
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
}
