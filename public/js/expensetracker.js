let tableBody = document.querySelector("#expense-table tbody");

document
  .querySelector(".choose-expense form")
  .addEventListener("submit", saveDetails);
window.addEventListener("load", () => {
  renderElements();
  showDownloadUrls();
});

tableBody.addEventListener("click", handleClick);

const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/expense",
  headers: {
    "auth-token": localStorage.getItem("token"),
  },
});

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

        // Check if 'next' is a child of 'tableBody' before attempting to insert
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
    document.getElementById("category").value = "movie";
  } catch (e) {
    console.log(e);
  }
}

async function renderElements() {
  if (localStorage.getItem("token") == undefined)
    window.location = "/login.html";

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
  window.location = "/login.html";
});

document.getElementById("premium").addEventListener("click", purchaseMembeship);

async function purchaseMembeship(e) {
  try {
    const response = await axios.post(
      "http://localhost:4000/payment/purchasemembership",
      null,
      {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      }
    );
    console.log(response);
    if (response.data.success) {
      localStorage.setItem("isPremiumUser", true);
      localStorage.setItem("token", res.data.token);

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
            document.getElementById("showleaderboard").classList.remove("hide");
            document.getElementById("premium").classList.add("hide");
          }

          alert("success");
        },
      };
      var rzp1 = new Razorpay(options);

      rzp1.on("payment.failed", async function (response) {
        alert("failded");
        console.log(response.error);
        const res = await axios.post(
          "http://localhost:4000/payment/failed",
          {
            payment_id: response.error.metadata.payment_id,
          },
          {
            headers: {
              "auth-token": localStorage.getItem("token"),
            },
          }
        );
        console.log(res);
      });

      rzp1.open();
      e.preventDefault();
    }
  } catch (e) {
    console.log(e);
  }
}

document
  .getElementById("showleaderboard")
  .addEventListener("click", async () => {
    try {
      const res = await axios.get(
        "http://localhost:4000/premium/showleaderboard",
        {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        }
      );
      // if(res.)
      if (res.status == 200) {
        console.log(res.data);
        const leaderboard = document.querySelector("#leaderboard ul");
        console.log(leaderboard);
        leaderboard.innerHTML = ``;
        res.data.forEach((user) => {
          const li = document.createElement("li");

          li.textContent = `Name : ${user.name} Total Expenses :${user.totalAmount}`;
          leaderboard.appendChild(li);
        });
      } else {
        alert("something went wrong");
      }
    } catch (e) {
      console.log(e);
    }
  });

document
  .getElementById("download-expense")
  .addEventListener("click", async () => {
    console.log("click");

    try {
      const result = await axiosInstance.get("/download");

      const a = document.createElement("a");
      a.href = result.data.fileUrl;
      a.download = "myexpense.txt";

      a.click();
    } catch (e) {
      console.log(e);
    }
  });

document.querySelector(".page").addEventListener("click", async (e) => {
  try {
    const items = +localStorage.getItem("totalItems") || 5;
    const ul = document.querySelector(".display tbody");

    if (e.target.classList.contains("page-btn")) {
      console.log("clicked");
      console.log(e.target.id == "next");
      const page = e.target.value;
      const result = await axiosInstance.post(`/get-expense?page=${page}`, {
        items,
      });
      console.log(result);
      let expenses = result.data.expenses;

      ul.innerHTML = ``;

      expenses.forEach((value) => {
        let row = createExpenseRow(value);
        ul.appendChild(row);
      });

      let prev = document.getElementById("prev");
      let curr = document.getElementById("curr");
      let next = document.getElementById("next");

      if (e.target.id == "next") {
        prev.classList.remove("hide");
        prev.textContent = curr.textContent;
        prev.value = curr.value;

        curr.textContent = next.textContent;
        curr.value = next.value;

        if (result.data.totalExpenses > items * page) {
          next.value = +page + 1;
          next.textContent = +page + 1;
        } else {
          next.classList.add("hide");
        }
      } else if (e.target.id == "prev") {
        if (page > 1) {
          next.classList.remove("hide");
          prev.textContent = page - 1;
          prev.value = page - 1;

          curr.textContent = page;
          curr.value = page;

          next.textContent = +page + 1;
          next.value = +page + 1;
        } else {
          prev.classList.add("hide");
          curr.textContent = 1;
          curr.value = 1;
          if (result.data.totalExpenses > items * page) {
            next.value = 2;
            next.textContent = 2;
            next.classList.remove("hide");
          } else {
            next.classList.add("hide");
          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
});

async function showDownloadUrls() {
  try {
    const getUrls = await axiosInstance.get("/get-all-urls");
    console.log(getUrls);
    let urls = getUrls.data.urls;
    const showDownloadUrls = document.getElementById("download-urls");
    if (urls.length > 0) {
      showDownloadUrls.classList.remove("hide");
      const ul = showDownloadUrls.querySelector("ul");
      urls.forEach((elem) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = elem.url;
        a.download = elem.createdAt + "-expense.txt";
        a.textContent = elem.createdAt + "-expense.txt";
        li.appendChild(a);

        ul.appendChild(li);
      });
    }
  } catch (e) {
    console.log(e);
  }
}

document.getElementById("display-expenses").addEventListener("change", (e) => {
  console.log(e.target.value);
  localStorage.setItem("totalItems", e.target.value);
  renderElements();
});
