const express = require('express')

const router = express.Router()
var Brevo = require('@getbrevo/brevo');
require('dotenv').config()


const User = require('../models/user')



router.post('/forgot-password' , async(req,res)=>{
    try{
        const email = req.body.email
        const user = await User.findOne({where : {email : email}})
        if(user == null)
             return res.status(404).json({success : true , msg :"Email not found"})

        var defaultClient = Brevo.ApiClient.instance;
        var apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BREVO_API_KEY

        var apiInstance = new Brevo.TransactionalEmailsApi();

        var sendSmtpEmail = new Brevo.SendSmtpEmail()
        const sender = { "email": "harishbpatil1998@gmail.com"}

        const reciever = [{
            "email": req.body.email
        }]
        const response = await apiInstance.sendTransacEmail({
            sender,
            to : reciever,
            subject : 'testing',
            textContent : `click the link to reset your password`
        })
        return res.json({success : true})


    }catch(e){
        console.log(e)
        return res.status(500).json({success : false ,msg :"Internal server error"})
    }
})


module.exports = router;