const form = document.forms[0];

form.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();
  console.log(e.target.email.value);

  try {
    const response = await axios.post(
      "http://localhost/password/forgot-password",
      {
        email: e.target.email.value,
      }
    );

    // Check if response is defined before accessing its properties
    if (response && response.status === 200) {
      alert("Email sent successfully");
    } else {
      alert("Unexpected response from the server");
    }
  } catch (error) {
    console.log(error);

    // Check if error.response is defined before accessing its properties
    if (error.response && error.response.status === 404) {
      alert("User not found");
    } else {
      alert("An unexpected error occurred");
    }
  }
}
