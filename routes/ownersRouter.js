const express = require('express');
const router = express.Router();
const ownerModel = require('../models/owners-model')

if (process.env.NODE_ENV === "development");//for setting environment variable >>>>>> set NODE_ENV=development(cmd prompt)
{
    router.post("/create", async (req, res) => {
        let owners = await ownerModel.find();
        if (owners.length > 0) {
            return res.status(503).send("You dont have permission to create new owner")
        }
        let { fullname, email, password } = req.body;
        let createdowner = await ownerModel.create({
            fullname,
            email,
            password,
        })
        res.status(201).send(createdowner);
    });
}

router.get("/admin", (req, res) => {
   let success= req.flash("success");
    res.render("createproducts",{success})
})

module.exports = router;