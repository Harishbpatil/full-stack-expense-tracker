document.getElementById("signup").addEventListener("submit", createUser);

const axiosInstance = axios.create({
  baseURL: "http://54.152.171.223:3000/user",
});

async function createUser(e) {
  e.preventDefault();
  console.log(e.target.name.value);
  console.log(e.target.email.value);
  console.log(e.target.password.value);
  try {
    const data = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
    };
    const res = await axiosInstance.post("/createUser", data);

    
    console.log(res);
    e.target.name.value = "";
    e.target.email.value = "";
    e.target.password.value = "";
  } catch (e) {
    console.log(e.response.status);
    if (e.response.status == 401) alert("user already exists");
    console.log(e);
  }
}
