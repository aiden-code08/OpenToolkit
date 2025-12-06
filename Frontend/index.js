import * as ejs from "ejs";
import Express from "express"

const app = Express()
app.get("/", (req, res) => {
    ejs.render('index', req.query)
})