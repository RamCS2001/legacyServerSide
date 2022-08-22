require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

var cors = require('cors');

const app = express();

mongoose.connect(process.env.LOCAL_MONGODB_URL);
const db = mongoose.connection;
db.on('error',(error)=> console.log("Error in connecting to database"));
db.once('open',()=> console.log("Connected to database"))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))

app.use(cors());

const User = require('./models/User');
const groupEvents = require('./models/groupEvents');
const count= require('./models/count');
const collegeEvents = require('./models/collegeEvents');

app.get('/', (req,res)=>{
    res.send("hello")
});

app.post('/createuser',(req,res)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    let email = req.body.email
    let phone_number = req.body.phone_number
    console.log ( req.body )
    User.findOne ( { email : email } , ( error , responseUser ) => {
        if ( error ) {
            console.log ( error )
            res.json ( { message : 0 } ) //always message 0 for error
            return
        }
        if ( responseUser ) { // user already exists with mailId 
         console.log ( "emailId already used" )
         res.json ( { message: 2 } ) //message 2 for duplicate mailId
        }
        else {
          User.findOne ( { phone_number : phone_number } , ( error , responseUser ) => {
            if ( error ) {
                console.log ( error )
                res.json ( { message: 0 } )
                return
            }
            if ( responseUser ) { //user already exists with the phone_number
                console.log ( "phone number already taken!" )
                res.json ( { message: 3 } ) //message 3 for duplicate phone_number
            }
            else {
                let college_name;
                if(req.body.college==="other"){
                    college_name= req.body.otherCollege;
                }
                else{
                    college_name= req.body.college;
                }
                count.findOne({college: college_name}, (err,doc)=>{
                    if(err) return err;
                    if(doc){
                        newCount = doc.numberOfParticipants+1
                        if(newCount-1>=50){
                            res.json ( { message: 4 } )   //message 4 college permit count exceed
                            return
                        }
                        count.findByIdAndUpdate(doc._id, {numberOfParticipants: newCount}, (err, docs)=>{
                            if(err) return err;
                        })
                    }
                    else{
                        count.create({college: college_name, numberOfParticipants: 1}, (err, docs)=>{
                            if(err) return err;
                        })
                    }
                    User.create ( req.body , ( error , responseUser ) => {
                        if ( error ) {
                            res.json ( { message: 0 } )
                            console.log ( error )
                            return
                        }
                        console.log ( responseUser )
                        collegeEvents.findOne({college: college_name}, (err,clg)=>{
                            if(err) return err
                            
                            if(clg) res.json ( { message: 1 } )   //message 1 registration successfull
                            else{
                                collegeEvents.create({college: college_name}, (err,newClg)=>{
                                    if(err) {
                                        res.json ( { message: 0 } )
                                        console.log ( error )
                                        return
                                    }
                                    if(newClg) res.json ( { message: 1 } )   //message 1 registration successfull
                                })
                            }
                        })
                        
                    } )
                })
            }
          } ) 
        }
    } )
});


app.post('/loginuser',(req,res)=>{
    console.log(req.body);
    User.findOne({ email: req.body.email }, function (err, user) {
        if (err) {
            console.log("Error in Login module");
            res.json({message: 0  }); // 0 -> Error
            return;
        }
        if (!user) {
            res.json({message: 2}); //0 -> User does not exist
            return
        } 
        else {
            if(req.body.password==user.password){
                const username = user.name;
                const userId = user._id;
                let college_name;
                if(user.college==="other"){
                    college_name= user.otherCollege;
                }
                else{
                    college_name= user.college;
                }
                const userDetails= {id: userId, phone_number: user.phone_number, email: user.email, college: college_name, gender: user.gender};
                // console.log(userDetails)
                const accessToken = jwt.sign(userDetails, process.env.ACCESS_TOKEN, {expiresIn: '600s'})
                // res.json({message: 1,token: accessToken});
                // res.cookie("token", accessToken, { httpOnly: true });
                res.status(200).json({
                    name: username,
                    idToken: accessToken, 
                    expiresIn: 600
                });
                return;
            }
            else{
                res.json({message: 3}); // invalid credentials 
                return;
            }
        }
    });
});

app.get('/getuserdetails',authenticateToken  ,(req,res)=>{
    const id = payload.id;
    User.findOne({_id: id}, function (err, user){
        if(err){
            return res.json({message: 0})// erroe contact admin
        }
        if(!user){
            return res.json({message: 0})// erroe contact admin // no user 
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
            let college_name
            if(user.college==="other"){
                college_name= user.otherCollege;
            }
            else{
                college_name= user.college;
            }
            const userDetail = {    
                college: college_name,
                degree: user.degree,
                department: user.department,
                year: user.year,
                phone_number: user.phone_number,
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
    mail= payload.email;
    phoneNo= payload.phone_number;

    if(mail!=req.body.email){
        res.json({message: -2}) //differnt user with differnt adminno
        return
    }
    if(phoneNo!=req.body.phone_number){
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
            let college_name = payload.college;
            collegeEvents.findOne({college: college_name}, (err,clg)=>{
                if(err) return err;
                if(clg) {
                    currentCount = clg[req.body.serverName];
                    if(req.body.serverName=="asyoulikeit"){
                        eventToUpdate={asyoulikeit: currentCount+1}
                    }
                    if(req.body.serverName=="bestmanager"){
                        eventToUpdate={bestmanager: currentCount+1}
                    }
                    if(req.body.serverName=="solosinging"){
                        eventToUpdate={solosinging: currentCount+1}
                    }
                    if(req.body.serverName=="solodance"){
                        eventToUpdate={solodance: currentCount+1}
                    }
                    if(req.body.serverName=="soloinstrumental"){
                        eventToUpdate={soloinstrumental: currentCount+1}
                    }
                    if(req.body.serverName=="pixie"){
                        eventToUpdate={pixie: currentCount+1}
                    }
                    if(req.body.serverName=="pencilsketching"){
                        eventToUpdate={pencilsketching: currentCount+1}
                    }
                    if(req.body.serverName=="yoga"){
                        eventToUpdate={yoga: currentCount+1}
                    }
                    if(req.body.serverName=="ezhuthaani"){
                        eventToUpdate={ezhuthaani: currentCount+1}
                    }
                    collegeEvents.findByIdAndUpdate(clg._id, eventToUpdate, (err, newClg)=>{
                        if(err) return err;
                        if(newClg) {
                            console.log(newClg)
                            res.json({message: 1});
                            return;
                        }
                    })
                }
            })
        }
    });
});

app.post('/CheckAllParticipants', authenticateToken, async (req,res)=>{

    mail= payload.email;
    phoneNo= payload.phone_number;

    if(mail!=req.body["0"].email){
        res.json({message: -2}) //different user with differnt mail
        return
    }
    if(phoneNo!=req.body["0"].phone_number){
        res.json({message: -3}) //different user with differnt phonenumber
        return
    }

    let count=0
    let unRegUser=[]
    let i;
    for( i=0; i<req.body.length; i++){
        const filter={ email: req.body[i].email}
        let user = await User.findOne(filter)
        if(!user){
            console.log(i)
            unRegUser.push(i+1)
            console.log(unRegUser)

        }
        else{
            if( payload.gender=='M' && user["gender"]=='F'){
                res.json({message: -7})
                return
            }
            else if(payload.gender=='F' && user["gender"]=='M'){
                res.json({message: -7})
                return
            }
            count++
        }
        if( i==req.body.length-1 && count<req.body.length ){
            res.json({message: -6, users: unRegUser})
            return
        }
        if(i==req.body.length-1 && count==req.body.length){
            res.json({message: 1})
            return
        }

        
    }
})

app.post('/participates', authenticateToken, (req, res)=>{
    let obj={exist: 0}
    req.body.teamname = req.body.teamname.toUpperCase();

    groupEvents.findOne({teamname: req.body.teamname, event: req.body.event} ,function (err, team) {
        if (err) {
            console.log("Error in Login module");
            res.json({message: -4}); // -1 -> Error
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
                const filter={ email: req.body.participants[i].email}
        
                User.findOneAndUpdate(filter, update, function (err, docs){
                    if (err){
                        console.log(err)
                        return
                    }                    
                });
            }
            
            groupEvents.create(req.body, function (err, doc) {
                if (err) {
                    console.log("Error");
                    console.log(err);
                    res.json({message: -4});
                    return;
                }
                else{
                    let college_name = payload.college;
                    collegeEvents.findOne({college: college_name}, (err,clg)=>{
                        if(err) return err;
                        if(clg) {
                            console.log(clg)
                            let eventToUpdate
                            currentCount = clg[req.body.serverName];
                            console.log(currentCount)

                            if(req.body.serverName=="divideandconquer"){
                                eventToUpdate={divideandconquer: currentCount+1}
                            }
                            if(req.body.serverName=="treasurehunt"){
                                eventToUpdate={treasurehunt: currentCount+1}
                            }
                            if(req.body.serverName=="themissingpiece"){
                                eventToUpdate={themissingpiece: currentCount+1}
                            }
                            if(req.body.serverName=="radiomirchi"){
                                eventToUpdate={radiomirchi: currentCount+1}
                            }
                            if(req.body.serverName=="englishpotpourri"){
                                eventToUpdate={englishpotpourri: currentCount+1}
                            }
                            if(req.body.serverName=="lyricalhunt"){
                                eventToUpdate={lyricalhunt: currentCount+1}
                            }
                            if(req.body.serverName=="tamilpotpourri"){
                                eventToUpdate={tamilpotpourri: currentCount+1}
                            }
                            if(req.body.serverName=="cinmatrix"){
                                eventToUpdate={cinmatrix: currentCount+1}
                            }
                            if(req.body.serverName=="groupdance"){
                                eventToUpdate={groupdance: currentCount+1}
                            }
                            if(req.body.serverName=="quiz"){
                                eventToUpdate={quiz: currentCount+1}
                            }
                            if(req.body.serverName=="postermaking"){
                                eventToUpdate={postermaking: currentCount+1}
                            }
                            if(req.body.serverName=="rangoli"){
                                eventToUpdate={rangoli: currentCount+1}
                            }
                            if(req.body.serverName=="dramatix"){
                                eventToUpdate={dramatix: currentCount+1}
                            }
                            console.log(eventToUpdate)
                            collegeEvents.findByIdAndUpdate(clg._id, eventToUpdate, (err, newClg)=>{
                                if(err) return err;
                                if(newClg) {
                                    console.log(newClg)
                                    res.json({message: 1});
                                    return;
                                }
                            })
                        }
                    })
                }
            });
        }
    })
})

app.get('/Individuallist', authenticateToken, (req, res)=>{
    if(payload.phone_number!="9944446591"){
        console.log ( "condition satisfied" )
        console.log ( payload )
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

app.get('/checkCollegeParticipation', authenticateToken, (req,res)=>{
    college_name= payload.college;
    console.log(college_name)
    collegeEvents.findOne({college: college_name}, (err,doc)=>{
        if(err) return err;
        if(doc){
            console.log(doc)
            res.json({message: 1, currentCount: doc[req.query.event]});
        }
        else{
            res.json({message: -1})
        }
    })
})
const port = process.env.PORT || 5000;
app.listen(port,()=>{ console.log("Server @ ",port)});
