import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
    filename : {
        type : String,
        required : true,
    },
    size : {
        type : Number,
        required : true,
    },
    uploadDate : {
        type : Date,
        default : Date.now(),
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
    },
    shareToken : { // For Security purpose 
        type : String,
        unique : true,
    },
    expiresAt : {
        type : Date,
        required : true,
    },
})

const File = mongoose.model("File", fileSchema)

export default File;