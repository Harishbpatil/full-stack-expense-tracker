const form = document.forms[0];

form.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await axios.post(
      "http://localhost:4000/password/forgot-password",
      {
        email: e.target.email.value,
      }
    );

    console.log(response);

    if (response.status === 200) {
      alert("Email sent successfully");
    }
  } catch (e) {
    console.log(e);

    if (e.response.status === 404) {
      alert("User not found");
    }
  }
}
