const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const path=require("path");
const db=require("./config/mongoose-connection");
const ownersRouter=require("./routes/ownersRouter");
const usersRouter=require("./routes/usersRouter");
const productsRouter=require("./routes/productsRouter");
const indexRouter=require("./routes/index");
const expressSession=require("express-session");
const flash=require("connect-flash");
require("dotenv").config();
const BASE_URL=process.env.BASE_URL

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());
app.use(
    expressSession({
        resave:false,
        saveUninitialized:true,
        secret:process.env.JWT_KEY,
    })
);
app.use(flash());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners", ownersRouter);
app.use("/products", productsRouter);
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.listen(3000, () => {
    console.log(`server running at ${BASE_URL}/`);

})