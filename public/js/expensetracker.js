document.addEventListener("DOMContentLoaded", function () {
  let table = document.querySelector(".display table");

  document
    .querySelector(".choose-expense form")
    .addEventListener("submit", saveDetails);

  window.addEventListener("load", renderElements);

  table.addEventListener("click", handleClick);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:4000/expense",
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
        let { data } = await axiosInstance.post("/add-expense", value, {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        });

        let row = createTableRow(data.data);
        table.appendChild(row);
      } else {
        let res = await axiosInstance.post(`/edit-expense/${id}`, value, {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        });

        if (res.status === 200) {
          value.id = id;
          let row = createTableRow(value);
          table.insertBefore(row, next);
        }

        next = null;
        id = null;
      }

      resetForm();
    } catch (e) {
      console.error(e);
    }
  }

  async function renderElements() {
    const authToken = localStorage.getItem("token");

    if (!authToken) {
      window.location = "/login.html";
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:4000/premium/checkPremium",
        {
          headers: {
            "auth-token": authToken,
          },
        }
      );

      const isPremiumUser = res.data.isPremiumUser;
      localStorage.setItem("isPremiumUser", isPremiumUser);

      if (isPremiumUser) {
        document.getElementById("premium-user").classList.remove("hide");
        document.getElementById("showleaderboard").classList.remove("hide");
        document.getElementById("premium").classList.add("hide");
      }

      const data = await axiosInstance.get("/", {
        headers: {
          "auth-token": authToken,
        },
      });

      const expenses = data.data.data;
      expenses.forEach((value) => {
        let row = createTableRow(value);
        table.appendChild(row);
      });
    } catch (e) {
      console.error(e);
    }
  }

  function createTableRow(data) {
    let row = document.createElement("tr");
    let dateCell = createTableCell("td", data.date);
    let descriptionCell = createTableCell("td", data.description);
    let categoryCell = createTableCell("td", data.category);
    let expenseCell = createTableCell("td", data.expense);
    let incomeCell = createTableCell("td", data.income);

    row.appendChild(dateCell);
    row.appendChild(descriptionCell);
    row.appendChild(categoryCell);
    row.appendChild(expenseCell);
    row.appendChild(incomeCell);

    let del = createButton("Delete expense", "delete", data.id);
    let edit = createButton("Edit expense", "edit", data.id);

    row.appendChild(del);
    row.appendChild(edit);

    return row;
  }

  function createTableCell(tag, text) {
    let cell = document.createElement(tag);
    cell.textContent = text;
    return cell;
  }

  function createButton(text, className, id) {
    let button = document.createElement("button");
    button.appendChild(document.createTextNode(text));
    button.classList.add(className);
    button.id = id;
    return button;
  }

  async function handleClick(e) {
    try {
      if (e.target.classList.contains("delete")) {
        let expenseId = e.target.id;
        let res = await axiosInstance.delete(`/deleteExpense/${expenseId}`, {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
        });

        if (res.status === 200) {
          table.removeChild(e.target.parentElement);
        }
      }

      if (e.target.classList.contains("edit")) {
        next = e.target.parentElement.nextElementSibling;
        id = e.target.id;
        let row = e.target.parentElement;
        let cells = row.getElementsByTagName("td");
        setValue("expense", cells[3].textContent);
        setValue("description", cells[1].textContent);
        setValue("category", cells[2].textContent);
        table.removeChild(row);
      }
    } catch (e) {
      console.error(e);
    }
  }

  function setValue(elementId, value) {
    document.getElementById(elementId).value = value;
  }

  function resetForm() {
    setValue("expense", "");
    setValue("description", "");
    setValue("category", "movie");
  }

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isPremiumUser");
    window.location = "/login.html";
  });

  document
    .getElementById("premium")
    .addEventListener("click", purchaseMembership);

  async function purchaseMembership(e) {
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

            if (res.data.isPremiumUser) {
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("isPremiumUser", true);
              document.getElementById("premium-user").classList.remove("hide");
              document
                .getElementById("showleaderboard")
                .classList.remove("hide");
              document.getElementById("premium").classList.add("hide");
            }

            alert("success");
          },
        };

        var rzp1 = new Razorpay(options);
        rzp1.on("payment.failed", async function (response) {
          alert("failed");
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
        });

        rzp1.open();
        e.preventDefault();
      }
    } catch (e) {
      console.error(e);
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

        if (res.status === 200) {
          const leaderboard = document.querySelector("#leaderboard ul");
          leaderboard.innerHTML = ``;

          res.data.forEach((user) => {
            const li = createListItem(
              `Name : ${user.name} Total Expenses :${user.totalAmount}`
            );
            leaderboard.appendChild(li);
          });
        } else {
          alert("something went wrong");
        }
      } catch (e) {
        console.error(e);
      }
    });

  document
    .getElementById("download-expenses")
    .addEventListener("click", async () => {
      try {
        const response = await axiosInstance.get("/download-expenses", {
          headers: {
            "auth-token": localStorage.getItem("token"),
          },
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;

        const timestamp = new Date().toISOString().replace(/[-:]/g, "");
        link.setAttribute("download", `expenses_${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
      }
    });

  function createListItem(text) {
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(text));
    return li;
  }
});
