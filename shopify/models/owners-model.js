const mongoose=require('mongoose')


const ownerSchema=mongoose.Schema({
    fullname:{
       type: String,
       trim:true,
       minLength:3
    },
    email:String,
    password:String,
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    picture:String,
    gstin:String
})

module.exports=mongoose.model('owner',ownerSchema)