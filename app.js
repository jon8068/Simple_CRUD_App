const express = require('express');
const mongoose = require('mongoose');
const app = express();
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const path = require('path');
const ExpressError = require('./utils/ExpressError');
const Employee = require('./models/employees');


mongoose.connect('mongodb://localhost:27017/maybank', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', async (req, res) => {
    const employees = await Employee.find({});
    res.render("homepage", {employees});
})

app.get('/newEmployee', (req, res) => {
    res.render("newEmployee");
})

app.post('/', async (req, res) => {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.redirect('/');
})

app.get('/:id/updateEmployee', async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    res.render('updateEmployee', {employee});
})

app.put('/:id', async(req, res) => {
    await Employee.findByIdAndUpdate(req.params.id, req.body, {runValidators: true, new: true});
    res.redirect('/');
})

app.delete('/:id', async(req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect('/');
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', { err });  
})

app.listen(3000, () => {
    console.log("Serving on port 3000");
})