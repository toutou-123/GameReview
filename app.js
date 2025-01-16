const express = require("express")
const session = require("express-session");
const userRouter = require("./router/userRouter");
const gameRouter = require("./router/gameRouter");
const categoryRouter = require("./router/categoryRouter");

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


app.listen(3000, () => {
    console.log("connecté au port 3000");
})