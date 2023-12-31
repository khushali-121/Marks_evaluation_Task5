const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

mongoose.connect('mongodb://localhost/student_data');

const User = require('./models/User');

app.use( bodyParser.urlencoded ({extended:true}));

app.set('views', __dirname + '/views');
app.set('view engine' ,'ejs');


app.get("/signup", (req , res)=>{
    res.render('signup');
})

app.post('/signup',async (req,res)=>{
    
    const { username,pass , email , course} = req.body;
    const result=  await User.find({});
    const user1= new User({
        username:username,
        password:pass,
        role:"Student",
        stuId: result.length+1,
        email: email,
        course: course,
        marks:{            
        },
    })
    user1.save().then((response)=>{
        res.render('login',{message:""});
    }).catch((err)=>{
        res.redirect('/signup');
    })
})

app.get('/login',(req,res)=>{
    res.render('login',{message: "" });

})

app.post('/login', async (req,res)=>{
    const { username, pass , role } =req.body;
        const result= await User.find({username : username});
        

    if(result.length > 0 && result[0].username == username && result[0].password==pass){
        if(role=="Teacher" && result[0].role=="Teacher"){
            const students =  await User.find({ role: 'Student'});
            res.render('teacherPage',{ user: username,students:students});
        }else{
            res.render('dashboard',{user:username,studentDetails:result[0]});
        }
    }else{
        res.render('login', {message:"Incorrect username or password"});
            }
});

app.get('/:course/:stuId',async (req,res)=>{
    const stuId =req.params.stuId;
    const course=req.params.course;
    const student = await User.findOne({stuId:stuId});
if(course =="mca"){
    res.render("mca",{student:student})
}else if(course=="bca"){
    res.render("bca",{student:student})
}else if(course =="12th"){
    res.render("12th",{student:student})
}else{
    res.render("10th",{student:student})
}
})

app.post("/storeData/:course/:stuId" , async (req , res)=>{
    const stuId =req.params.stuId;
    const course = req.params.course;
    var percentage ;
        
    const stuDetails = await User.findOne({stuId:stuId});
   
if(course =="mca"){
    stuDetails.marks={
        CN : Number(req.body.CN),
        DS : Number(req.body.DS),
        AD : Number(req.body.AD),
        WD : Number(req.body.WD),
        DSA: Number(req.body.DSA),
        
    }   
    percentage = ((stuDetails.marks.CN+stuDetails.marks.DS+stuDetails.marks.AD+stuDetails.marks.WD+stuDetails.marks.DSA)/500)*100;

}else if(course =="bca"){
    stuDetails.marks={
            OS : Number(req.body.OS),
            SPM : Number(req.body.SPM),
            js : Number(req.body.js),
            ML : Number(req.body.ML),
            CC: Number(req.body.CC)
        }
    percentage=((stuDetails.marks.OS+stuDetails.marks.SPM+stuDetails.marks.js+stuDetails.marks.ML+stuDetails.marks.CC)/500)*100;

    }else if(course =="12th"){
        stuDetails.marks={
            phy : Number(req.body.phy),
            math : Number(req.body.math),
            chem : Number(req.body.chem),
            cs : Number(req.body.cs),
            bio: Number(req.body.bio)
        }
      percentage=((stuDetails.marks.phy+stuDetails.marks.math+stuDetails.marks.chem+stuDetails.marks.cs+stuDetails.marks.bio)/500)*100;

        }else{
            stuDetails.marks={
                eng : Number(req.body.eng),
                math: Number(req.body.math),
                science : Number(req.body.science),
                gk : Number(req.body.gk),
                sst : Number(req.body.sst)
            }
        percentage=((stuDetails.marks.eng+stuDetails.marks.math+stuDetails.marks.science+stuDetails.marks.gk+stuDetails.marks.sst)/(500))*100;

        }
    try{
        await User.findOneAndUpdate({stuId:stuId},{marks:stuDetails.marks,percentage:percentage})
         const students = await User.find({role:"Student"})        
          res.render("teacherPage",{user:"",students:students});
     }catch(error){console.log(error)}

})

app.get('/result', async (req, res) => {
    try {
        const PercentageStudent = await User.aggregate([
            {
                $match: { role: 'Student' }
            },
            {
                $project: {
                    username: 1,
                    percentage: 1,
                    course:1
                }
            },
            {
                $sort: { percentage: -1,course: 1 }
            },{
                $group: {
                    _id: '$course',
                    students: { $push: { username: '$username', percentage: '$percentage' } }
                }
            }
    
        ]);
    
        res.render('result', { PercentageStudent: PercentageStudent });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000,()=>{
    console.log(" DB connected ");
});