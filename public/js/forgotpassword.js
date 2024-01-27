const form = document.forms[0]

form.addEventListener('submit', handleSubmit)

async function handleSubmit(e){
    e.preventDefault()
    console.log(e.target.email.value)
    try{
        const response = await axios.post('http://localhost:4000/password/forgotpassword',{
            email : e.target.email.value
        })
        console.log(response)
        if(response.status == 200)
            alert("user not found")
    }catch(e){
        console.log(e)
        if(e.response.status == 404)
             alert("user not found")

    }
}