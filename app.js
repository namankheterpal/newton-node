var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

var app = express();

var users= [];

var jsonParser = bodyParser.json();

var mock = {
    a:10
}

var privateKey ='abc';


app.use(express.static(path.join(__dirname,'public')));

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

app.listen(5001);


