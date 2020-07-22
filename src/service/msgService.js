const  express  = require("express");
const  connectdb  = require("../db/dbConnect");
const  Msgs  = require("../models/msgSchema");

const  router  =  express.Router();

router.route("/msgs/:room").get((req, res, next) =>  {
        res.setHeader("Content-Type", "application/json");
        res.statusCode  =  200;
        connectdb.then(db  =>  {
            Msgs.find({ room: req.params.room }).then(msg  =>  {
            res.json(msg);
        });
    });
});

module.exports  =  router;