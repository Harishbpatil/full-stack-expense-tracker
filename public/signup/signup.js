// Add an event listener to the signup form for submission
document.getElementById("signup").addEventListener("submit", createUser);

// Create an Axios instance with a base URL for user-related operations
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/user",
});

// Async function to handle user registration
async function createUser(e) {
  // Prevent the default form submission behavior
  e.preventDefault();

  // Log form input values for debugging
  console.log(e.target.name.value);
  console.log(e.target.email.value);
  console.log(e.target.password.value);

  try {
    // Prepare user registration data from the form
    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };
    alert("signup Succussfully!!")
    window.location = "/login/login.html";
    // Make a POST request to the server to create a new user
    const res = await axiosInstance.post("/createUser", data);

    // Log the response from the server
    console.log(res);
    
    // Clear form input values after successful registration
    e.target.name.value = "";
    e.target.email.value = "";
    e.target.password.value = "";
  } catch (e) {
    // Handle errors, log the status code, and show an alert for user existence
    console.log(e.response.status);
    if (e.response.status == 401) {
      alert("User already exists");
    }
    console.log(e);
  }
}
