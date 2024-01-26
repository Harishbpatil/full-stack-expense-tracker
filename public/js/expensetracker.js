let ul = document.querySelector(".display ul");

document
  .querySelector(".choose-expense form")
  .addEventListener("submit", saveDetails);

window.addEventListener("load", renderElements);

ul.addEventListener("click", handleClick);

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

      let li = display(data.data);
      ul.appendChild(li);
    } else {
      let res = await axiosInstance.post(`/edit-expense/${id}`, value, {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      if (res.status === 200) {
        value.id = id;
        let li = display(value);
        ul.insertBefore(li, next);
      }

      next = null;
      id = null;
    }

    resetForm();
  } catch (e) {
    console.error(e);
    // Handle errors appropriately
  }
}

async function renderElements() {
  const authToken = localStorage.getItem("token");

  if (!authToken) {
    window.location = "/login.html";
    return;
  }

  try {
    const res = await axios.get("http://localhost:4000/premium/checkPremium", {
      headers: {
        "auth-token": authToken,
      },
    });

    const isPremiumUser = res.data.isPremiumUser; // Corrected premium user check
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

    const users = data.data.data;
    users.forEach((value) => {
      let li = display(value);
      ul.appendChild(li);
    });
  } catch (e) {
    console.error(e);
    // Handle errors appropriately
  }
}

function display(data) {
  let li = document.createElement("li");
  let span1 = createElement("span", data.expense);
  let span2 = createElement("span", data.description);
  let span3 = createElement("span", data.category);

  li.appendChild(span1);
  li.appendChild(span2);
  li.appendChild(span3);

  let del = createButton("Delete expense", "delete", data.id);
  let edit = createButton("Edit expense", "edit", data.id);

  li.appendChild(del);
  li.appendChild(edit);
  return li;
}

function createElement(tag, text) {
  let element = document.createElement(tag);
  element.textContent = text;
  return element;
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
        ul.removeChild(e.target.parentElement);
      }
    }

    if (e.target.classList.contains("edit")) {
      next = e.target.parentElement.nextElementSibling;
      id = e.target.id;
      let li = e.target.parentElement;
      let spans = li.getElementsByTagName("span");
      setValue("expense", spans[0].textContent);
      setValue("description", spans[1].textContent);
      setValue("category", spans[2].textContent);
      ul.removeChild(li);
    }
  } catch (e) {
    console.error(e);
    // Handle errors appropriately
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
            document.getElementById("showleaderboard").classList.remove("hide");
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
    // Handle errors appropriately
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
          const li = createElement(
            "li",
            `Name : ${user.name} Total Expenses :${user.totalAmount}`
          );
          leaderboard.appendChild(li);
        });
      } else {
        alert("something went wrong");
      }
    } catch (e) {
      console.error(e);
      // Handle errors appropriately
    }
  });
