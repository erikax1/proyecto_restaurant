const mongoose=require('../connect');
const user={
    name:String,
    email:String,
    password:String,
    admin:Boolean,
    notify:[]
}
const usermodel=mongoose.model('user', user);
module.exports=usermodel;