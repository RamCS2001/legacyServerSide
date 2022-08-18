require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

var cors = require('cors');

const app = express();

mongoose.connect(process.env.MONGODB_URL);
const db = mongoose.connection;
db.on('error',(error)=> console.log("Error in connecting to database"));
db.once('open',()=> console.log("Connected to database"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(cors());

const User = require('./models/User');
const groupEvents = require('./models/groupEvents');

app.get('/', (req,res)=>{
    res.send("hello")
});

app.post('/createuser',(req,res)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    // console.log(req.body);
    req.body.roll_number = req.body.roll_number.toUpperCase();
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log("Error in finding user in signing up");
            res.json({message: -1}); // -1 -> Error
            return;
        }
        if (!user) {
            User.findOne({ admission_number: req.body.admission_number }, function (err, user) {
                if (err) {
                    console.log("Error in finding user in signing up");
                    res.json({message: -1}); // -1 -> Error
                    return;
                }
                if(!user){
                    User.findOne({ roll_number: req.body.roll_number }, function (err, user) {
                        if (err) {
                            console.log("Error in finding user in signing up");
                            res.json({message: -1}); // -1 -> Error
                            return;
                        }
                        if(!user){
                            User.create(req.body, function (err, user) {
                                if (err) {
                                    console.log("Error in creating user in signing up");
                                    console.log(err);
                                    res.json({message: -1});
                                    return;
                                }
                                // console.log("User: ", user);
                            });
                            unregistered.findOne({admission_number: req.body.admission_number}, function(err, unRegUser){
                                if(err){
                                    onsole.log("Error in finding user in signing up");
                                    res.json({message: -1}); // -1 -> Error
                                    return;
                                }
                                if(unRegUser){
                                    // console.log(unRegUser)
                                    const filter= {admission_number: req.body.admission_number}
                                    let update
                                    if(unRegUser.event==9){
                                        update= {$set: {divideandconquer: 1}}
                                    }
                                    if(unRegUser.event==10){
                                        update= {$set: {tressurehunt: 1}}
                                    }
                                    if(unRegUser.event==11){
                                        update= {$set: {themissingpiece: 1}}
                                    }
                                    if(unRegUser.event==12){
                                        update= {$set: {radiomirchi: 1}}
                                    }
                                    if(unRegUser.event==13){
                                        update= {$set: {englishpotpourri: 1}}
                                    }
                                    if(unRegUser.event==14){
                                        update= {$set: {lyricalhunt: 1}}
                                    }
                                    if(unRegUser.event==15){
                                        update= {$set: {tamilpotpourri: 1}}
                                    }
                                    if(unRegUser.event==16){
                                        update= {$set: {cinmatrix: 1}}
                                    }
                                    if(unRegUser.event==17){
                                        update= {$set: {quiz: 1}}
                                    }
                                    if(unRegUser.event==18){
                                        update= {$set: {groupdance: 1}}
                                    }
                                    if(unRegUser.event==19){
                                        update= {$set: {postermaking: 1}}
                                    }
                                    if(unRegUser.event==20){
                                        update= {$set: {rangoli: 1}}
                                    }
                                    if(unRegUser.event==21){
                                        update= {$set: {dramatix: 1}}
                                    }
                                    
                                    User.findOneAndUpdate(filter, update, function (err, docs){
                                        if (err){
                                            console.log(err)
                                            return
                                        }
                                        res.json({message: 1});
                                        return
                                    })    
                                    
                                }else{
                                    res.json({message: 1});
                                    return
                                }
                            })
                        }
                        else{
                            res.json({message: -3}); //-3->  roll number Already exist
                            return;
                        }
                    })
                }
                else{
                    res.json({message: -2}); //-2->  Admin number Already exist
                    return;
                }
            })
        } else {
            res.json({message: 0}); //0 -> User Already exist
            return;
        }
      });
});


app.post('/loginuser',(req,res)=>{
    console.log(req.body);
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log("Error in Login module");
            res.json({message: -1}); // -1 -> Error
            return;
        }
        if (!user) {
            res.json({message: -2}); //0 -> User does not exist
            return
        } 
        else {
            if(req.body.password==user.password){
                const username = user.name;
                const userId = user._id;
                const adminNo= user.admission_number;
                const rollno= user.roll_number;
                const userDetails= {id: userId, admission_number: adminNo, roll_number: rollno};
                // console.log(userDetails)
                const accessToken = jwt.sign(userDetails, process.env.ACCESS_TOKEN, {expiresIn: '600s'})
                // res.json({message: 1,token: accessToken});
                // res.cookie("token", accessToken, { httpOnly: true });
                res.status(200).json({
                    name: username,
                    idToken: accessToken, 
                    expiresIn: 600
                });
                // res.json({message: 1, name: userDetails});
                return;
            }
            else{
                res.json({message: 0}); // invalid credentials 
                return;
            }
        }
    });
});

app.get('/getuserdetails',authenticateToken  ,(req,res)=>{
    const id = payload.id;
    User.findOne({_id: id}, function (err, user){
        if(err){
            return res.json({message: -2})// erroe contact admin
        }
        if(!user){
            return res.json({message: -2})// erroe contact admin // no user 
        }
        else{
            // console.log(user);
            let events= "";
            if(user.asyoulikeit==1){
                events = events + "As You Like It&";
            }if(user.bestmanager==1){
                events = events + "Best Manager&";
            }if(user.solosinging==1){
                events = events + "Solo Singing&";
            }if(user.solodance==1){
                events = events + "Solo Dance&";
            }if(user.soloinstrumental==1){
                events = events + "Solo Instrumental&";
            }if(user.pixie==1){
                events = events + "Pixie&";
            }if(user.pencilsketching==1){
                events = events + "Pencil Sketching&";
            }if(user.yoga==1){
                events = events + "Yoga&";
            }
            if(user.ezhuthaani==1){
                events = events + "Ezhuthaani&";
            }
            if(user.divideandconquer==1){
                events = events + "Divide and Conquer&";
            }
            if(user.tressurehunt==1){
                events = events + "Treasure hunt&";
            }
            if(user.themissingpiece==1){   
                events = events + "The Missing Piece&";
            }
            if(user.radiomirchi==1){   
                events = events + "Radio Mirchi&";
            }
            if(user.englishpotpourri==1){   
                events = events + "English Potpourri&";
            }
            if(user.lyricalhunt==1){   
                events = events + "Lyrical Hunt&";
            }
            if(user.tamilpotpourri==1){   
                events = events + "Tamil Potpourri&";
            }
            if(user.cinmatrix==1){   
                events = events + "Cinematrix (Short Flim)&";
            }
            if(user.groupdance==1){   
                events = events + "Group Dance&";
            }
            if(user.postermaking==1){   
                events = events + "Poster Making&";
            }
            if(user.dramatix==1){   
                events = events + "Dramatix&";
            }
            if(user.quiz==1){   
                events = events + "Quizzards of Oz&";
            }
            if(user.rangoli==1){   
                events = events + "Rangoli&";
            }
            let replaced= events.replace(/&/g, ",");
            let yourEvents= replaced.replace(/.$/,".")
            // console.log(yourEvents)
            const userDetail = {    
                year: user.year,
                department: user.department,
                section: user.section,
                roll_number: user.roll_number,
                admission_number: user.admission_number,
                email: user.email,
                yourEvents: yourEvents
            }
            res.json({message: 1,userDetails: userDetail})
        }
    })
})

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    // console.log(authHeader)
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.json({message: 0}); // no token

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) {
            console.log(err)
            return res.json({message: -1}) // token expired
        }
        payload = jwt.decode(token);
        next()
    })
}


app.post('/participate', authenticateToken, async function (req,res){
    adminNo= payload.admission_number;
    rollno= payload.roll_number;
    req.body.roll_number = req.body.roll_number.toUpperCase();

    if(adminNo!=req.body.admission_number){
        res.json({message: -2}) //differnt user with differnt adminno
        return
    }
    if(rollno!=req.body.roll_number){
        res.json({message: -3}) //differnt user with differnt rollno
        return
    }
    const filter={ _id: payload.id }
    let update
    if(req.body.event=='0'){
        update={$set: {asyoulikeit: 1}}
    }
    if(req.body.event=='1'){
        update={$set: {bestmanager: 1}}
    }
    if(req.body.event=='2'){
        update={$set: {solodance: 1}}
    }
    if(req.body.event=='3'){
        update={$set: {solosinging: 1}}
    }
    if(req.body.event=='4'){
        update={$set: {soloinstrumental: 1}}
    }
    if(req.body.event=='5'){
        update={$set: {pixie: 1}}
    }
    if(req.body.event=='6'){
        update={$set: {pencilsketching: 1}}
    }
    if(req.body.event=='7'){
        update={$set: {yoga: 1}}
    }
    if(req.body.event=='8'){
        update={$set: {ezhuthaani: 1}}
    }

    User.findOneAndUpdate(filter, update, function (err, docs){
        if (err){
            console.log(err)
            res.json({message: -4});
            return
        }
        else{
            // console.log(docs)
            res.json({message: 1});
            return;
        }
    });
});

app.post('/participates', authenticateToken, (req, res)=>{
    if(req.body.event==10) return res.json({message: "Closed"});
    // console.log(req.body)
    adminNo= payload.admission_number;
    rollno= payload.roll_number;
    req.body.participants["0"].roll_number = req.body.participants["0"].roll_number.toUpperCase();

    if(adminNo!=req.body.participants["0"].admission_number){
        res.json({message: -2}) //differnt user with differnt adminno
        return
    }
    if(rollno!=req.body.participants["0"].roll_number){
        res.json({message: -3}) //differnt user with differnt rollno
        return
    }
    let obj={exist: 0}
    groupEvents.findOne({teamname: req.body.teamname, event: req.body.event} ,function (err, team) {
        if (err) {
            console.log("Error in Login module");
            res.json({message: -1}); // -1 -> Error
            return;
        }
        if (team) {
            obj.exist=1;
            res.json({message: -5}) // team name already exist
        } 
        else{
            let update
            if(req.body.event==9){
                update= {$set: {divideandconquer: 1}}
            }
            if(req.body.event==10){
                update= {$set: {tressurehunt: 1}}
            }
            if(req.body.event==11){
                update= {$set: {themissingpiece: 1}}
            }
            if(req.body.event==12){
                update= {$set: {radiomirchi: 1}}
            }
            if(req.body.event==13){
                update= {$set: {englishpotpourri: 1}}
            }
            if(req.body.event==14){
                update= {$set: {lyricalhunt: 1}}
            }
            if(req.body.event==15){
                update= {$set: {tamilpotpourri: 1}}
            }
            if(req.body.event==16){
                update= {$set: {cinmatrix: 1}}
            }
            if(req.body.event==17){
                update= {$set: {quiz: 1}}
            }
            if(req.body.event==18){
                update= {$set: {groupdance: 1}}
            }
            if(req.body.event==19){
                update= {$set: {postermaking: 1}}
            }
            if(req.body.event==20){
                update= {$set: {rangoli: 1}}
            }
            if(req.body.event==21){
                update= {$set: {dramatix: 1}}
            }
            
            for(let i=0; i<req.body.participants.length; i++){
                const filter={ admission_number: req.body.participants[i].admission_number}
        
                User.findOneAndUpdate(filter, update, function (err, docs){
                    if (err){
                        console.log(err)
                        return
                    }
                    // console.log(docs)
                    if(docs==null){
                        const unregUser= { admission_number: req.body.participants[i].admission_number, event: req.body.event}
                        // console.log(unregUser);

                        unregistered.create(unregUser, function(err,doc){
                            if (err) {
                                console.log("Error");
                                console.log(err);
                                res.json({message: -1});
                                return;
                            }
                        })

                    }
                });
            }
            
            groupEvents.create(req.body, function (err, doc) {
                if (err) {
                    console.log("Error");
                    console.log(err);
                    res.json({message: -1});
                    return;
                }
                // console.log("Doc: ", doc);

                res.json({message: 1});
            });
        }
    })
})

app.get('/Individuallist', authenticateToken, (req, res)=>{
    if(payload.admission_number!="aaaaa"){
        res.json({message: -1});
    }
    else{
        let filter
        if(req.query.event=='0'){
            filter= {asyoulikeit: 1}
        }
        if(req.query.event=='1'){
            filter= {bestmanager: 1}
        }
        if(req.query.event=='2'){
            filter= {solodance: 1}
        }
        if(req.query.event=='3'){
            filter={solosinging: 1}
        }
        if(req.query.event=='4'){
            filter= {soloinstrumental: 1}
        }
        if(req.query.event=='5'){
            filter= {pixie: 1}
        }
        if(req.query.event=='6'){
            filter={pencilsketching: 1}
        }
        if(req.query.event=='7'){
            filter={yoga: 1}
        }
        if(req.query.event=='8'){
            filter={ezhuthaani: 1}
        }
        User.find(filter,function (err, docs){
            if(err){
                console.log(err)
                return
            }
            console.log(docs)
            if(docs){
                res.json({message: 1,data: docs})
            }
        })

    }
})

app.get('/Grouplist', authenticateToken, (req, res)=>{
    if(payload.admission_number!="aaaaa"){
        res.json({message: -1});
    }
    else{
        const filter = {event: req.query.event}
        groupEvents.find(filter, async function(err,docs){
            if(err){
                console.log(err)
                return
            }
            else{
                let responseData=[]
                for(let i=0; i<docs.length; i++){
                    let team={}
                    team["teamName"]=docs[i]["teamname"];
                    let rollNo = [];
                    for(let j=0; j<docs[i].participants.length; j++){
                        rollNo.push(docs[i].participants[j]["admission_number"]);
                    }
                    let members = await User.find({ admission_number: { $in: rollNo } });
                    team["members"] = members;
                    team["totalMembers"]=docs[i].participants
                    responseData.push(team)
                }
                res.json({message: 1, data: responseData})
            }
        })
    }
})



app.get('/all',authenticateToken, (req,res)=>{
    if(payload.admission_number!="aaaaa"){
        res.json({message: -1});
    }
    User.find((err,docs)=>{
        if(err) return
        res.json({message: 1,data: docs})
    })

})
const port = process.env.PORT || 5000;
app.listen(port,()=>{ console.log("Server @ ",port)});
