document.getElementById("login").addEventListener("submit", loginUser);

const axiosInstance = axios.create({
  baseURL: "http://54.152.171.223:4000/user",
});



async function loginUser(e) {
  e.preventDefault();

  const data = {
    email: e.target.email.value,
    password: e.target.password.value,
  };

  try {
    const result = await axiosInstance.post("/login", data);
    console.log(result);

    if (result.data.success) {
      alert("Login successful");
      localStorage.setItem("token", result.data.token);

      // Redirect to the expensetracker page
      window.location = "/expensetracker.html";
    }
  } catch (e) {
    console.log(e);
    alert(e.response.data.msg);
  }
}
