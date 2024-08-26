const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    fullname:{
       type: String,
       trim:true,
       minlength:3
    },
    email:String,
    password:String,
    cart:[{
        
        // Default quantity
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
           
            // Default quantity
        
    }],

    isadmin: {
        type: Boolean,
        default: false // Default to not admin
    },
        orders:{
        type:Array,
        default:[]
    },
    contact:Number,
    picture:String
})

module.exports=mongoose.model('user',userSchema);