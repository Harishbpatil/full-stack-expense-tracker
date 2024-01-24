const Expense = require('../models/expense')

exports.getAll = (req,res)=>{
    req.user.getExpenses({raw : true ,
         attributes :["id" , "expense" ,"category" , "description"]})
         .then(data =>{
        return res.json({data})
    })
    .catch(e =>{
        console.log(e)
        return res.status(500).json({msg : "Internal server error"})
    })
}

exports.addExpense = (req,res)=>{
    const expense = req.body.expense;
    const description = req.body.description;
    const category = req.body.category;

    req.user.createExpense({
        expense : expense,
        description : description,
        category : category
    }).then((data)=>{
        return res.json({data})
    })
    .catch(e =>{
        console.log(e)
        return res.status(403).json({success : false})
    })
}

exports.deleteExpense = (req,res)=>{
    const id = req.params.id;
    req.user.getExpenses({where : { id : id}}).then(expense =>{
        return expense[0].destroy()
    }).then(()=>{
        return res.status(200).json({success : true , msg : "deleted successfully"})
    }).catch(e =>{
        console.log(e)
        return res.status(401).json({success : false })
    })
}

exports.editExpense = (req,res)=>{
    const id = req.params.id;
    req.user.getExpenses({ where : {id : id}} ).then(data =>{
        data[0].expense = req.body.expense,
        data[0].description = req.body.description,
        data[0].category = req.body.category
        return data[0].save()
    }).then(() =>{
        return res.json({success : true})
    }).catch(e =>{
        console.log(e)
        return res.status(403).json({success : false})
    })
}