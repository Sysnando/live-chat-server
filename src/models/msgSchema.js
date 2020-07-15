const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;
const  msgSchema  =  new Schema(
    {
        room:   {type: Number},
        color:  {type: String},
        msg:    {type: String},
        user:   {type: String},        
        time:   {type: String}
    },
    {
        timestamps: true
    }
);

let  Msg  =  mongoose.model("Msg", msgSchema);
module.exports  =  Msg;