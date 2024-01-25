let ul = document.querySelector(".display ul")
document.querySelector(".choose-expense form").addEventListener('submit', saveDetails);
window.addEventListener('load', renderElements)
ul.addEventListener('click', handleClick)


const axiosInstance = axios.create({
    baseURL: "http://localhost:4000/expense"

})

var next = null;
var id = null;

async function saveDetails(e) {
    e.preventDefault();
    // console.log("demo")

    try {
        const value = {
            expense: e.target.expense.value,
            description: e.target.description.value,
            category: e.target.category.value
        }
        if (id === null) {

            console.log(localStorage.getItem('token'))
            let { data } = await axiosInstance.post('/add-expense', value, {

                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            }

            )
            // let {data } = await axiosInstance.post('/add-expense' ,
            // //      value
            // // )
            console.log(data.data)
            let li = display(data.data)
            ul.appendChild(li)
        } else {
            let res = await axiosInstance.post(`/edit-expense/${id}`, value, {
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            })
            console.log(res)
            if (res.status == 200) {
                value.id = id;
                let li = display(value);
                ul.insertBefore(li, next)

            }
            next = null
            id = null


        }


        document.getElementById('expense').value = ''
        document.getElementById('description').value = ''
        document.getElementById('category').value = 'movie'
    } catch (e) {
        console.log(e)
    }
}

async function renderElements() {
  if (localStorage.getItem('token') == undefined)
      window.location = "/login.html";

  try {
      let data = await axiosInstance.get('/', {
          headers: {
              "auth-token": localStorage.getItem('token')
          }
      });

      let users = data.data.data;
      users.forEach((value) => {
          let li = display(value);
          ul.appendChild(li);
      });

      let loggedInUserId = localStorage.getItem('token');
      let loggedInUser = users.find((user) => user.id === loggedInUserId);
      if (loggedInUser) {
          let premiumMessageElement = document.getElementById('premiumMessage');
          let buyPremiumButton = document.getElementById('premium');

          // Check premium status from the token
          const decodedToken = parseJwt(localStorage.getItem('token'));
          const isPremiumUser = decodedToken.isPremiumuser;

          if (isPremiumUser) {
              // Display premium message and hide "Buy Premium" button
              if (premiumMessageElement) {
                  premiumMessageElement.style.display = 'block';
              }
              if (buyPremiumButton) {
                  buyPremiumButton.style.display = 'none';
              }
          } else {
              // Hide premium message and display "Buy Premium" button
              if (premiumMessageElement) {
                  premiumMessageElement.style.display = 'none';
              }
              if (buyPremiumButton) {
                  buyPremiumButton.style.display = 'block';
              }
          }
      }
  } catch (error) {
      console.log(error);
  }
}


function display(data) {
    let li = document.createElement('li')
    let span1 = document.createElement('span')
    span1.textContent = data.expense
    let span2 = document.createElement('span')
    span2.textContent = data.description
    let span3 = document.createElement('span')
    span3.textContent = data.category

    li.appendChild(span1)
    li.appendChild(span2)
    li.appendChild(span3)


    let del = document.createElement('button')
    del.appendChild(document.createTextNode("Delete expense"))
    del.classList.add('delete')
    del.id = data.id
    let edit = document.createElement('button')
    edit.appendChild(document.createTextNode("Edit expense"))
    edit.classList.add('edit')
    edit.id = data.id
    li.appendChild(del)
    li.appendChild(edit)
    return li;
}

async function handleClick(e) {
    try {
        if (e.target.classList.contains('delete')) {
            let expenseId = e.target.id;
            let res = await axiosInstance.delete(`/deleteExpense/${expenseId}`, {
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            })
            if (res.status == 200) {
                ul.removeChild(e.target.parentElement)
            }
            console.log(res)
        }
        if (e.target.classList.contains('edit')) {
            next = e.target.parentElement.nextElementSibling
            id = e.target.id;
            let li = e.target.parentElement;
            let spans = li.getElementsByTagName('span')
            document.getElementById('expense').value = spans[0].textContent
            document.getElementById('description').value = spans[1].textContent
            document.getElementById('category').value = spans[2].textContent
            ul.removeChild(li)
        }
    } catch (e) {
        console.log(e)
    }
}



document.getElementById("logout").addEventListener('click', () => {
    localStorage.removeItem("token")
    localStorage.removeItem("isPremiumUser")
    window.location = "/login.html"
})

document.getElementById('premium').addEventListener('click', purchaseMembeship)

async function purchaseMembeship(e) {
    // alert("perchased")

    try {

        const response = await axios.post('http://localhost:4000/payment/purchasemembership', null, {
            headers: {
                "auth-token": localStorage.getItem('token')
            }
        })
        console.log(response)
        var options = {
            "key": response.data.key,

            "order_id": response.data.order_id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": async function (response) {
                const res = await axios.post("http://localhost:4000/payment/success", {

                    "payment_id": response.razorpay_payment_id,
                    "razorpay_signature": response.razorpay_signature

                }, {
                    headers: {
                        "auth-token": localStorage.getItem('token')
                    }
                })
                console.log(res)
                if (res.data.isPremiumUser) {
                    localStorage.setItem('isPremiumUser', true)
                    document.getElementById('premium-user').classList.remove('hide')
                    document.getElementById('showleaderboard').classList.remove('hide')
                    document.getElementById('premium').classList.add('hide')
                }


                alert('success')
            }
        }
        var rzp1 = new Razorpay(options);
        rzp1.on('payment.failed', async function (response) {
            alert('failded')
            console.log(response.error)
            const res = await axios.post("http://localhost:4000/payment/failed", {

                "payment_id": response.error.metadata.payment_id

            }, {
                headers: {
                    "auth-token": localStorage.getItem('token')
                }
            })
            console.log(res)
        });

        rzp1.open();
        e.preventDefault();
    } catch (e) {
        console.log(e)
    }
}


document.getElementById("showleaderboard").addEventListener('click', async()=>{
    try{
        const res = await axios.get('http://localhost:4000/premium/showleaderboard',{
            headers :{
                "auth-token": localStorage.getItem('token')
            }
        })
        // if(res.)
        if(res.status){
            console.log(res.data)
            const leaderboard = document.querySelector('#leaderboard ul')
            console.log(leaderboard)
            res.data.forEach(user =>{

                const li = document.createElement('li')

                li.textContent = `Name : ${user.name} Total Expenses :${user.total}`
                leaderboard.appendChild(li)
            })
        }else{
            alert('something went wrong')
        }
    }catch(e){
        console.log(e)
        
    }
})