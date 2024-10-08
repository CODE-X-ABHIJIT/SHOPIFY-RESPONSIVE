const mongoose=require('mongoose');
const config=require('config');
const dbgr=require('debug')("development:mongoose");

mongoose.connect("mongodb+srv://codexabhijit:AbhijiT%402003@cluster0.dsiyd.mongodb.net/scatch")
.then(function(){
    dbgr("connected");
    
})
.catch(function(err){
    dbgr(err);
    
})

module.exports=mongoose.connection;