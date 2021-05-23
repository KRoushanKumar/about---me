const express = require('express');
const bodyParser = require('body-Parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql')
const bcrypt = require('bcrypt');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const PORT = 3001;


const saltRound =10; 
const db=mysql.createPool({
    host:"localhost",
    user:'root',
    password:'',
    database:'first',
   // insecureAuth : true
})
//db.connect();
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET","POST","DELETE","PUT"],
    credentials:true
}));
app.use(session({
    key:"UserID",
    secret:"Roushan",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:60*60*24,
    },

}))
app.use(cookieParser()) 

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));

app.get("/api/get",(req,res)=>{
    const sqlquery = "select * from movie_review; ";
    db.query(sqlquery,(err,result)=>{
        res.send(result);
    });

});

app.delete("/api/delete/:movie",(req,res)=>{
    console.log("delete");
    const MovieName = req.params.movie;
    console.log(MovieName);
    
    const sqlquery="delete from movie_review where Moviename = ? ;";
    db.query(sqlquery,MovieName,(err,result)=>{
      if(err)console.log(err);
 });
    
 });

 app.put("/api/update",(req,res)=>{
    console.log("Update");
    const MovieName = req.body.movie;
    const Review = req.body.review;
    console.log(MovieName);
    console.log(" New Review : "+ Review);
    const sqlquery="UPDATE movie_review SET review=? WHERE Moviename = ?;";
    db.query(sqlquery,[Review,MovieName],(err,result)=>{
      if(err)console.log(err);
 });
    
 });

app.post("/api/insert",(req,res)=>{
   const MovieName = req.body.MovieName;
   const Review = req.body.Review;
   const sqlquery="insert into movie_review  (Moviename,review) values(?,?); "
   db.query(sqlquery,[MovieName,Review],(err,result)=>{
    console.log(err);
    console.log(result);
});
   
});

app.post("/api/registration",(req,res)=>{
    const UserName = req.body.UserName;
    const EmailId = req.body.EmailId;
    const Password = req.body.Password;
    const sqlquery="insert into appuser  (UserName, EmailId, password) values(?,?,?); ";
    bcrypt.hash(Password,saltRound,(err,hash)=>{
        if(err)
        console.log(err);

        db.query(sqlquery,[UserName,EmailId,hash],(err,result)=>{
            if(err)console.log(err);

    })
   
     
 });
    
 });



 app.post("/api/Login",(req,res)=>{
    const EmailId = req.body.EmailId;
    const Password = req.body.Password;
    const sqlquery="select * from  appuser  where Emailid=? ;"
    db.query(sqlquery,EmailId,(err,result)=>{
     if(err){
     console.log(err);
     }
     else if(result.length>0){
        bcrypt.compare(Password,result[0].password,(error,response)=>{
            if(error)
            {
                console.log(error);
            }
            if(response)
            {
                console.log("loged in ..")
                req.session.user = result[0].EmailId  
                
                res.send({loggedIn: true, user: req.session.user});              
            }
        })
        
        
     }
     else{
        console.log("NOT loged in ..")
         res.send({massage : "Wrong Authentication"});
     }
     
 });
    
 });

app.listen(process.env.PORT || PORT ,()=>{
    console.log(`running on port ${PORT}  `);
}
)
