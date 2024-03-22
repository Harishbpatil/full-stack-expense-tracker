const express = require('express')
const router = express.Router();


const Expense = require('../models/expense')
const expense = require('../controllers/expense')

const authenticate = require('../middleware/auth')


// router.get('/' ,authenticate, expense.getAll)  

router.post('/add-expense' , authenticate,expense.addExpense) 

router.delete('/deleteExpense/:id' , authenticate, expense.deleteExpense) 

router.post('/edit-expense/:id' , authenticate,expense.editExpense)

router.post('/get-expense' , authenticate ,expense.getExpenses )


router.get('/download' , authenticate , expense.downloadExpenses)
router.get('/get-all-urls' , authenticate , expense.downloadUrls)


module.exports = router;