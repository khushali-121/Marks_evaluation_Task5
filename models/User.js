

const mongoose = require('mongoose');

const userSchema=new mongoose.Schema({
    username:String,
    password:String,
    role:String,
    stuId:Number,
    course: String,  
    email: String,
        marks: {
          
        },
     percentage:Number,
      
      
});

module.exports = mongoose.model('User', userSchema);
