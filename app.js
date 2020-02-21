var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var axios = require('axios');

var imageParser = require('express-fileupload');

var app = express();

var users= [];

var jsonParser = bodyParser.json();
var url ="http://www.mocky.io/v2/5e4d6ec32d00002c9ec0df79";

var mock = {
    a:10
}

var privateKey ='abc';


app.use(express.static(path.join(__dirname,'public')));

app.use((req,res,next)=>{
    res.header("ACcess-Control-Allow-Origin","https://www.google.com");
    next();
})

app.get('/users',(req,res)=>{
    res.json(users);
})

app.post('/verify',jsonParser,(req,res)=>{
    let {token} = req.body;
    try {
        var decoded = jwt.verify(token, privateKey);
        console.log(decoded);
        res.send(decoded);
      } catch(err) {
          console.log('erros',err)
      }
})

app.post('/login',jsonParser,(req,res)=>{
    let  {email, password} = req.body;
    let user = users.find(user => user.email===email);

    console.log(user);

    if(user){
        bcrypt.compare(password, user.hash, function(err, result) {
            if(err){
                console.log(err);
                res.send('error');
            }
            if(result){
                // res.send('Logged in');
                
                // jwt.sign({ email, dob:'16Aug94' }, privateKey, { algorithm: 'RS256' }, function(err, token) {
                //     if(err)console.log(err);
                //     res.json({success:'Logged in', token});
                // });

                var token  = jwt.sign(
                    { email, dob:'16Aug94' }, 
                    privateKey,
                    { expiresIn: '1h' }
                    );
                    
                res.json({success:'Logged in', token});


            } else{
                res.send('Wrong password');
            }
        });
    } else{
        res.send('No User exist');
    }

})

app.post('/signup',jsonParser,(req,res)=>{
    let  {email, password} = req.body;

   
    
    bcrypt.genSalt(10, function(err, salt) {
        if(err){
            console.log(err);
        }
        if(salt){
            bcrypt.hash(password, salt , function(err, hash) {
                if(err){
                    console.log(err);
                }
                if(hash){
                    users.push({
                        email,
                        hash
                    });

                    res.json({status: 'success'});
                }
            });
        }
    });
    
})


app.get('/search',jsonParser,(req, res)=>{
    var id =  req.query.id;

    axios.get(url)
        .then((result)=>{
            var data = result.data;
            
            var myObj = data.find(user=>user.id==id);

            res.send(myObj);
        });    
})




app.use(imageParser());


app.post("/upload",(req,res)=>{

    if(req.files && req.files.movieImg){
        var file = req.files.movieImg,
        filename = file.name;

        file.mv("./upload/"+filename,(err)=>{
            if(err){
                console.log(err);
            }
            else{

                if(req.body)
                {
                    users.push({
                        user: req.body.name,
                        profilePic: filename
                    });
                }
                
                res.send('succuss');

            }
        });
    }
    else{
        res.send('error');
    }
})

console.log('at 5001');
app.listen(5004);

