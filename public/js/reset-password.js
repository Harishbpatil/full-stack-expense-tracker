var resetId = null;

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/password",
});

window.addEventListener("load", async () => {
  try {
    let url = window.location.href;
    let arr = url.split("?reset=");
    resetId = arr[1];

    if (resetId == null || resetId.length === 0) {
      alert("Invalid link. Redirecting to forgot-password.html");
      window.location.replace("forgot-password.html");
      return;
    }

    const res = await axiosInstance.get(`/check-password-link/${resetId}`);

    if (!res.data.isActive) {
      alert("Link expired. Get a new one. Redirecting to forgot-password.html");
      window.location.replace("forgot-password.html");
      return;
    }

    console.log(res);
  } catch (error) {
    console.error(error);
    alert("An unexpected error occurred. Redirecting to forgot-password.html");
    window.location.replace("forgot-password.html");
  }
});

const form = document.forms[0];
form.addEventListener("submit", handleSubmit);

async function handleSubmit(e) {
  try {
    e.preventDefault();
    const newPassword = e.target["new-password"].value;
    const confirmPassword = e.target["confirm-password"].value;

    if (newPassword !== confirmPassword) {
      alert("New and confirm passwords do not match");
    } else {
      const res = await axiosInstance.post(`/reset-password/${resetId}`, {
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        alert("Password changed successfully. You can now login.");
        window.location.replace("login.html");
      } else {
        alert(res.data.msg || "An error occurred. Please try again.");
      }
    }
  } catch (error) {
    console.error(error);
    alert("An unexpected error occurred. Please try again.");
  }
}
