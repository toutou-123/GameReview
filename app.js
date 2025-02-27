const express = require("express")
const session = require("express-session");
const userRouter = require("./router/userRouter");
const gameRouter = require("./router/gameRouter");
const categoryRouter = require("./router/categoryRouter");
require('dotenv').config()

const app = express()
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret:"zefnobrnbrtggt56g7t",
    resave: true,
    saveUninitialized: true
}))
app.use(userRouter)
app.use(gameRouter)
app.use(categoryRouter)

app.use((req, res, next) => {
    console.log("Requête brute :", req.rawHeaders);
    next();
});

app.listen(process.env.PORT, () => {
    console.log("connecté au port " + process.env.PORT);
})