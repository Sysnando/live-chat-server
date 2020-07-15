// const  express  = require("express");
// const  connectdb  = require("../db/dbConnect");
// const  Msgs  = require("../models/msgSchema");

// const  router  =  express.Router();

// router.route("/").get((req, res, next) =>  {
//         res.setHeader("Content-Type", "application/json");
//         res.statusCode  =  200;
//         connectdb.then(db  =>  {
//             Msgs.find({}).then(msg  =>  {
//             res.json(msg);
//         });
//     });
// });

// module.exports  =  router;