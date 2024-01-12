
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
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
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

  
  updateExpenseList();


  document.getElementById("amount").value = "";
  document.getElementById("description").value = "";
  document.getElementById("category").value = "";
  document.getElementById("expenseId").value = "";
  document.getElementById("addExpenseBtn").innerText = "Add Expense";
}


async function deleteExpense(expenseId) {
  try {
    const response = await fetch(`/expense/deleteExpense/${expenseId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      console.log("Expense deleted successfully");
    } else {
      console.error("Failed to delete expense");
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
  }


  updateExpenseList();
}


async function editExpense(expenseId) {
  try {
    const response = await fetch(`/expense/getExpense/${expenseId}`);

    if (response.ok) {
      const expense = await response.json();

      
      document.getElementById("amount").value = expense.amount;
      document.getElementById("description").value = expense.description;
      document.getElementById("category").value = expense.category;

      
      document.getElementById("expenseId").value = expense.id;

      
      document.getElementById("addExpenseBtn").innerText = "Update Expense";
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
    const response = await fetch("/expense/getExpenses");

    if (response.ok) {
      const expenses = await response.json();

      
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
      console.error("Failed to retrieve expenses");
    }
  } catch (error) {
    console.error("Error retrieving expenses:", error);
  }
}


updateExpenseList();
