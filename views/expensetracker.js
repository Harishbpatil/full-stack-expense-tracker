document.addEventListener("DOMContentLoaded", async function () {
  // Call updateExpenseList on page load
  await updateExpenseList();

  async function addOrUpdateExpense() {
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const description = document.getElementById("description").value;
    const expenseId = document.getElementById("expenseId").value;

    if (!amount) {
      alert("Please enter the amount.");
      return;
    }

    const method = expenseId ? "PUT" : "POST";
    const url = expenseId
      ? `/expense/updateExpense/${expenseId}`
      : "/expense/addExpense";

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ amount, description, category }),
      });

      if (response.ok) {
        console.log("Expense added/updated successfully");
      } else {
        console.error("Failed to add/update expense. Response:", response);
      }
    } catch (error) {
      console.error("Error adding/updating expense:", error);
    }

    // Update the expense list after adding or updating
    await updateExpenseList();

    // Clear the input fields after adding or updating
    clearInputFields();
  }

  async function deleteExpense(expenseId) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/expense/deleteExpense/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        console.log("Expense deleted successfully");
      } else {
        console.error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
    }

    // Update the expense list after deleting
    await updateExpenseList();
  }

  async function editExpense(expenseId) {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/expense/getExpense/${expenseId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        const expense = await response.json();

        // Populate the input fields with the fetched expense details
        populateInputFields(expense);

        // Change the button text to "Update Expense"
        changeButtonText("Update Expense");
      } else {
        console.error("Failed to fetch expense details");
      }
    } catch (error) {
      console.error("Error fetching expense details:", error);
    }
  }

  async function updateExpenseList() {
    const expenseList = document.getElementById("expenseList");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/expense/getExpenses", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (response.ok) {
        const responseData = await response.json();

        if (responseData.success && Array.isArray(responseData.expenses)) {
          const expenses = responseData.expenses;

          // Clear the existing list content
          expenseList.innerHTML = "";

          expenses.forEach((expense) => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `Amount: $${
              expense && expense.amount ? expense.amount : 0
            }, Category: ${
              expense && expense.category ? expense.category : "N/A"
            }, Description: ${
              expense && expense.description ? expense.description : "N/A"
            }
                  <button class="btn btn-warning btn-sm mx-1" onclick="editExpense(${
                    expense.id
                  })">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteExpense(${
                    expense.id
                  })">Delete</button>`;
            expenseList.appendChild(listItem);
          });
        } else {
          console.error("Invalid format for expenses data:", responseData);
        }
      } else {
        console.error("Failed to retrieve expenses");
      }
    } catch (error) {
      console.error("Error retrieving expenses:", error);
    }
  }

  // Function to clear input fields
  function clearInputFields() {
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
    document.getElementById("expenseId").value = "";
    changeButtonText("Add Expense");
  }

  // Function to populate input fields with expense details
  function populateInputFields(expense) {
    document.getElementById("amount").value = expense.amount || "";
    document.getElementById("description").value = expense.description || "";
    document.getElementById("category").value = expense.category || "";
    document.getElementById("expenseId").value = expense.id || "";
  }

  // Function to change the button text
  function changeButtonText(text) {
    document.getElementById("addExpenseBtn").innerText = text;
  }

  // Assign functions to the global scope for inline event handlers
  window.addOrUpdateExpense = addOrUpdateExpense;
  window.editExpense = editExpense;
  window.deleteExpense = deleteExpense;
});
