document.addEventListener("DOMContentLoaded", () => {
  let tableBody = document.querySelector("#expense-table tbody");

  document
    .querySelector(".choose-expense form")
    .addEventListener("submit", saveDetails);

  window.addEventListener("load", () => {
    renderElements();
    showDownloadUrls();
  });

  if (tableBody) {
    tableBody.addEventListener("click", handleClick);
  }

  const axiosInstance = axios.create({
    baseURL: "http://localhost:4000/expense",
  });

  // Add an interceptor to include the authentication token in the headers
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["auth-token"] = token;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  var next = null;
  var id = null;

  async function saveDetails(e) {
    e.preventDefault();

    try {
      const value = {
        expense: e.target.expense.value,
        description: e.target.description.value,
        category: e.target.category.value,
      };

      if (id === null) {
        let { data } = await axiosInstance.post("/add-expense", value);
        let row = createExpenseRow(data.data);
        tableBody.insertBefore(row, tableBody.firstChild);
      } else {
        let res = await axiosInstance.post(`/edit-expense/${id}`, value);
        if (res.status == 200) {
          value.id = id;
          let row = createExpenseRow(value);

          if (tableBody.contains(next)) {
            tableBody.insertBefore(row, next);
          } else {
            tableBody.appendChild(row);
          }
        }
        next = null;
        id = null;
      }

      document.getElementById("expense").value = "";
      document.getElementById("description").value = "";
      document.getElementById("category").value = "select";
    } catch (e) {
      console.log(e);
    }
  }
  
  async function renderElements() {
    if (localStorage.getItem("token") == undefined) {
      // window.location = "/login/login.html";
      return;
    }

    try {
      let res = await axios.get("http://localhost:4000/premium/checkPremium", {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      if (res.status == 200) {
        localStorage.setItem("isPremiumUser", res.data);
      }

      if (localStorage.getItem("isPremiumUser") == "true") {
        document.getElementById("premium-user").classList.remove("hide");
        document.getElementById("showleaderboard").classList.remove("hide");
        document.getElementById("premium").classList.add("hide");
      } else {
        let viewExpenseElement = document.getElementById("view-expense");
        if (viewExpenseElement) {
          viewExpenseElement.classList.add("hide");
        }
        document.getElementById("showleaderboard").classList.add("hide");
        document.getElementById("download-expense").classList.add("hide");
      }

      const ITEMS_PER_PAGE = +localStorage.getItem("totalItems") || 5;
      document.getElementById("display-expenses").value = ITEMS_PER_PAGE;
      let result = await axiosInstance.post("/get-expense", {
        items: ITEMS_PER_PAGE,
      });

      if (ITEMS_PER_PAGE > result.data.totalExpenses) {
        document.getElementById("next").classList.add("hide");
      } else {
        document.getElementById("next").classList.remove("hide");
      }

      let expenses = result.data.expenses;
      tableBody.innerHTML = ``;

      expenses.forEach((value) => {
        let row = createExpenseRow(value);
        tableBody.appendChild(row);
      });
    } catch (error) {
      console.error(error);
    }
  }

  function createExpenseRow(data) {
    let tr = document.createElement("tr");
    let td1 = document.createElement("td");
    td1.textContent = data.expense;
    let td2 = document.createElement("td");
    td2.textContent = data.description;
    let td3 = document.createElement("td");
    td3.textContent = data.category;
    let td4 = document.createElement("td");

    let deleteBtn = document.createElement("button");
    deleteBtn.appendChild(document.createTextNode("Delete expense"));
    deleteBtn.classList.add("delete");
    deleteBtn.id = data.id;

    let editBtn = document.createElement("button");
    editBtn.appendChild(document.createTextNode("Edit expense"));
    editBtn.classList.add("edit");
    editBtn.id = data.id;

    td4.appendChild(deleteBtn);
    td4.appendChild(editBtn);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);

    return tr;
  }

  async function handleClick(e) {
    try {
      if (e.target.classList.contains("delete")) {
        let expenseId = e.target.id;
        let res = await axiosInstance.delete(`/deleteExpense/${expenseId}`);
        if (res.status == 200) {
          let rowToRemove = e.target.parentElement.parentElement;
          tableBody.removeChild(rowToRemove);
        }
      }
      if (e.target.classList.contains("edit")) {
        next = e.target.parentElement.parentElement;
        id = e.target.id;
        let row = e.target.parentElement.parentElement;
        let cells = row.getElementsByTagName("td");

        document.getElementById("expense").value = cells[0].textContent;
        document.getElementById("description").value = cells[1].textContent;
        document.getElementById("category").value = cells[2].textContent;

        tableBody.removeChild(row);
      }
    } catch (e) {
      console.error(e);
    }
  }

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isPremiumUser");
    window.location = "/login/login.html";
  });

  document
    .getElementById("premium")
    .addEventListener("click", purchaseMembership);

  async function purchaseMembership(e) {
    try {
      const response = await axios.post(
        "http://localhost:4000/payment/purchaseMembership",
        null,
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );

      if (response.data.success) {
        localStorage.setItem("isPremiumUser", true);
        localStorage.setItem("token", response.data.token);

        document.getElementById("premium-user").classList.remove("hide");
        document.getElementById("showleaderboard").classList.remove("hide");
        document.getElementById("premium").classList.add("hide");
      } else {
        var options = {
          key: response.data.key,
          order_id: response.data.order_id,
          handler: async function (response) {
            const res = await axios.post(
              "http://localhost:4000/payment/success",
              {
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              {
                headers: {
                  "auth-token": localStorage.getItem("token"),
                },
              }
            );
            console.log(res);
            if (res.data.isPremiumUser) {
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("isPremiumUser", true);
              document.getElementById("premium-user").classList.remove("hide");
              document
                .getElementById("showleaderboard")
                .classList.remove("hide");
              document.getElementById("premium").classList.add("hide");
            }
          },
        };
        var rzp = new Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function showDownloadUrls() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found in localStorage.");
        return;
      }
  
      const response = await axiosInstance.get("/get-all-urls", {
        headers: {
          "auth-token": token,
        },
      });
  
      console.log(response.data);
      // Handle response data to display download URLs
    } catch (error) {
      console.error(error);
    }
  }
});
