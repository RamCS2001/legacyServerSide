require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
var cors = require('cors');
var nodemailer = require('nodemailer');

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
const count= require('./models/count');
const collegeEvents = require('./models/collegeEvents');
const paymentHash = require ( './models/PaymentHash' )

app.get('/', (req,res)=>{
    res.send("Hello")
});

function getHash ( timestamp , status , amount , payload , reverse ) {
  let sha512 = require ( "crypto" ).createHash ( "sha512" )
  let formulatedString = process.env.MERCHANT_KEY + "|"  + (payload.email + timestamp) + "|" + amount + "|legacyentry|" + payload.name + "|" + payload.email + "|||||||||||" + process.env.SALT
  if ( reverse ) {
     formulatedString = process.env.SALT + "|" + status + "|||||||||||" + payload.email + "|" + payload.name + "|legacyentry|" + amount + ".00|" + ( payload.email + timestamp ) + "|" + process.env.MERCHANT_KEY
   }
   sha512.update ( formulatedString )
   return reverse ? sha512.digest ( ).toString ( "hex" ) : { time: timestamp , digest: sha512.digest ( ).toString ( "hex" ) }
}

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
                    req.body.otherCollege= req.body.otherCollege.toUpperCase()
                    req.body.college= req.body.otherCollege
                    college_name= req.body.otherCollege;
                }
                else{
                    req.body.college= req.body.college.toUpperCase()
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
app.post ( "/payment_status" , ( req , res ) => {
    paymentHash.find ( { email: req.body.email } , ( error , result ) => {
      if ( error )
      {
        console.log ( "error in payment status: finding email hash " , error )
        throw error
      }
      else {
        if ( result [ result.length - 1 ] [ req.body.status ] == req.body.hash ) {
           if ( req.body.status == "success" )
             User.findOneAndUpdate ( { email: req.body.email } , { regFeesPayment: true, accommodationFeesPayment: ( parseInt ( req.body.amount ) > 300 ), dayoneAccomodation: ( parseInt ( req.body.amount ) == 425 ), daytwoAccomodation: ( parseInt ( req.body.amount ) == 550 )  } , ( error , result ) => {
                if ( error )
                  throw error
                if(result) 
                    res.redirect ( "https://legacy-mepco.vercel.app/paid?status=" + req.body.status )
             } )
        }
        else
        {
           res.redirect ( "https://legacy-mepco.vercel.app/paid?status=breach" )
        }
      }
    } )
} )
app.post ( "/payhash" , authenticateToken , ( req , res ) => {
   let timestamp = new Date ( ).getTime ( )
   result = getHash ( timestamp , "" , req.body.amount , payload , false )
   console.log ( "result: " , result )
   paymentHash.create ( { email: payload.email , failure: getHash ( timestamp , "failure" , req.body.amount , payload , true )  , success: getHash ( timestamp , "success" , req.body.amount , payload , true )} )
   res.send  ( { payurl: 'https://secure.payu.in/_payment' , data: { key: process.env.MERCHANT_KEY , txnid: ( payload.email + result [ "time" ] ), amount: req.body.amount , productinfo: "legacyentry" , firstname: payload.name , email: payload.email , phone: payload.phone_number , surl: "https://legacymepco.herokuapp.com/payment_status" , furl: "https://legacymepco.herokuapp.com/payment_status" , hash: result [ "digest" ] } } )
} )

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
                const userDetails= {id: userId, name: user.name ,phone_number: user.phone_number, email: user.email, college: college_name, gender: user.gender};
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
            if(user.tamildebate==1){
                events = events + "நீயா நானா?&";
            }if(user.martialarts==1){
                events = events + "MARTIAL ARTS&";
            }if(user.bestmanager==1){
                events = events + "BEST MANAGER&";
            }if(user.voiceoflegacy==1){
                events = events + "VOICE OF LEGACY (Solo singing)&";
            }if(user.musicunplugged==1){
                events = events + "MUSIC UNPLUGGED (Solo Instrumental)&";
            }if(user.kavithaigal==1){
                events = events + "கவித்திடல்&";
            }if(user.pixie==1){
                events = events + "PIXIE (PHOTO CONTEST)&";
            }if(user.yoga==1){
                events = events + "YOGA&";
            }if(user.debateguru==1){
                events = events + "DEBATE GURU&";
            }if(user.makeyourmove==1){
                events = events + "MAKE YOUR MOVE (Solo Dance)&";
            }if(user.extempore==1){
                events = events + "EXTEMPORE&";
            }if(user.pencilsketching==1){
                events = events + "PENCIL SKETCHING&";
            }if(user.symphonique==1){
                events = events + "SYMPHONIQUE (Orchestra)&";
            }if(user.divideandconquer==1){
                events = events + "DIVIDE AND CONQUER (MULTITASKING)&";
            }if(user.monstersmuss==1){   
                events = events + "MONSTERS’ MUSS (English Language Game)&";
            }if(user.kalakkalkalatta==1){   
                events = events + "KALAKKAL KALATTA&";
            }if(user.sherlockholmes==1){   
                events = events + "SHERLOCK HOLMES&";
            }if(user.quizzards==1){   
                events = events + "QUIZZARDS (QUIZ)&";
            }if(user.rangoli==1){   
                events = events + "RANGOLI&";
            }if(user.graphix==1){   
                events = events + "GRAPHIX (TRAILER TIME)&";
            }if(user.choreoboom==1){   
                events = events + "CHOREO BOOM (Group Dance)&";
            }if(user.ideapresentation==1){   
                events = events + "IDEA PRESENTATION&";
            }if(user.marketomania==1){   
                events = events + "MARKETOMANIA&";
            }if(user.dramatics==1){   
                events = events + "DRAMATICS&";
            }if(user.cinematrix==1){   
                events = events + "CINEMATRIX (SHORT FILM)&";
            }if(user.liphomaniac==1){   
                events = events + "LIPHOMANIAC (SPELL BEE)&";
            }if(user.expressions==1){   
                events = events + "EXPRESSIONS (FACE PAINTING)&";
            }if(user.treasurehunt==1){
                events = events + "TREASURE HUNT&";
            }if(user.warwithwords==1){   
                events = events + "WAR WITH WORDS&";
            }if(user.translation==1){   
                events = events + "மறுவார்த்தை (Translation)&";
            }if(user.lyricalhunt==1){   
                events = events + "LYRICAL HUNT&";
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
                yourEvents: yourEvents,
                paid: user.regFeesPayment,
                accPaid: user.accommodationFeesPayment
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
        update={$set: {tamildebate : 1}}
    }
    if(req.body.event=='1'){
        update={$set: {martialarts : 1}}
    }
    if(req.body.event=='2'){
        update={$set: {bestmanager : 1}}
    }
    if(req.body.event=='3'){
        update={$set: {voiceoflegacy : 1}}
    }
    if(req.body.event=='4'){
        update={$set: {musicunplugged: 1}}
    }
    if(req.body.event=='5'){
        update={$set: {kavithaigal : 1}}
    }
    if(req.body.event=='6'){
        update={$set: {pixie : 1}}
    }
    if(req.body.event=='7'){
        update={$set: {yoga: 1}}
    }
    if(req.body.event=='8'){
        update={$set: {debateguru : 1}}
    }
    if(req.body.event=='9'){
        update={$set: {makeyourmove : 1}}
    }
    if(req.body.event=='10'){
        update={$set: {extempore : 1}}
    }
    if(req.body.event=='11'){
        update={$set: {pencilsketching  : 1}}
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
                    if(req.body.serverName=="tamildebate"){
                        eventToUpdate={tamildebate: currentCount+1}
                    }
                    if(req.body.serverName=="martialarts"){
                        eventToUpdate={martialarts : currentCount+1}
                    }
                    if(req.body.serverName=="bestmanager"){
                        eventToUpdate={bestmanager : currentCount+1}
                    }
                    if(req.body.serverName=="voiceoflegacy"){
                        eventToUpdate={voiceoflegacy: currentCount+1}
                    }
                    if(req.body.serverName=="musicunplugged"){
                        eventToUpdate={musicunplugged: currentCount+1}
                    }
                    if(req.body.serverName=="kavithaigal"){
                        eventToUpdate={kavithaigal : currentCount+1}
                    }
                    if(req.body.serverName=="pixie"){
                        eventToUpdate={pixie : currentCount+1}
                    }
                    if(req.body.serverName=="yoga"){
                        eventToUpdate={yoga: currentCount+1}
                    }
                    if(req.body.serverName=="debateguru"){
                        eventToUpdate={debateguru : currentCount+1}
                    }
                    if(req.body.serverName=="makeyourmove"){
                        eventToUpdate={makeyourmove : currentCount+1}
                    }
                    if(req.body.serverName=="extempore"){
                        eventToUpdate={extempore  : currentCount+1}
                    }
                    if(req.body.serverName=="pencilsketching "){
                        eventToUpdate={pencilsketching   : currentCount+1}
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
        const filter={ email: req.body[i].email, phone_number: req.body[i].phone_number}
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
            if(req.body.event==12){
                update= {$set: {symphonique : 1}}
            }
            if(req.body.event==13){
                update= {$set: {divideandconquer : 1}}
            }
            if(req.body.event==14){
                update= {$set: {monstersmuss: 1}}
            }
            if(req.body.event==15){
                update= {$set: {kalakkalkalatta: 1}}
            }
            if(req.body.event==16){
                update= {$set: {sherlockholmes: 1}}
            }
            if(req.body.event==17){
                update= {$set: {quizzards: 1}}
            }
            if(req.body.event==18){
                update= {$set: {rangoli: 1}}
            }
            if(req.body.event==19){
                update= {$set: {graphix: 1}}
            }
            if(req.body.event==20){
                update= {$set: {choreoboom: 1}}
            }
            if(req.body.event==21){
                update= {$set: {ideapresentation: 1}}
            }
            if(req.body.event==22){
                update= {$set: {marketomania: 1}}
            }
            if(req.body.event==23){
                update= {$set: {dramatics: 1}}
            }
            if(req.body.event==24){
                update= {$set: {cinematrix: 1}}
            }
            if(req.body.event==25){
                update= {$set: {liphomaniac: 1}}
            }
            if(req.body.event==26){
                update= {$set: {expressions: 1}}
            }
            if(req.body.event==27){
                update= {$set: {treasurehunt: 1}}
            }
            if(req.body.event==28){
                update= {$set: {warwithwords: 1}}
            }
            if(req.body.event==29){
                update= {$set: {translation: 1}}
            }
            if(req.body.event==30){
                update= {$set: {lyricalhunt: 1}}
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
                            if(req.body.serverName=="symphonique"){
                                eventToUpdate={symphonique: currentCount+1}
                            }
                            if(req.body.serverName=="divideandconquer"){
                                eventToUpdate={divideandconquer: currentCount+1}
                            }
                            if(req.body.serverName=="monstersmuss"){
                                eventToUpdate={monstersmuss: currentCount+1}
                            }
                            if(req.body.serverName=="kalakkalkalatta"){
                                eventToUpdate={kalakkalkalatta: currentCount+1}
                            }
                            if(req.body.serverName=="sherlockholmes"){
                                eventToUpdate={sherlockholmes: currentCount+1}
                            }
                            if(req.body.serverName=="quizzards"){
                                eventToUpdate={quizzards: currentCount+1}
                            }
                            if(req.body.serverName=="rangoli"){
                                eventToUpdate={rangoli: currentCount+1}
                            }
                            if(req.body.serverName=="graphix"){
                                eventToUpdate={graphix: currentCount+1}
                            }
                            if(req.body.serverName=="choreoboom"){
                                eventToUpdate={choreoboom: currentCount+1}
                            }
                            if(req.body.serverName=="ideapresentation"){
                                eventToUpdate={ideapresentation: currentCount+1}
                            }
                            if(req.body.serverName=="marketomania"){
                                eventToUpdate={marketomania: currentCount+1}
                            }
                            if(req.body.serverName=="dramatics"){
                                eventToUpdate={dramatics: currentCount+1}
                            }
                            if(req.body.serverName=="cinematrix"){
                                eventToUpdate={cinematrix: currentCount+1}
                            }
                            if(req.body.serverName=="liphomaniac"){
                                eventToUpdate={liphomaniac: currentCount+1}
                            }
                            if(req.body.serverName=="expressions"){
                                eventToUpdate={expressions: currentCount+1}
                            }
                            if(req.body.serverName=="treasurehunt"){
                                eventToUpdate={treasurehunt: currentCount+1}
                            }
                            if(req.body.serverName=="warwithwords"){
                                eventToUpdate={warwithwords: currentCount+1}
                            }
                            if(req.body.serverName=="translation"){
                                eventToUpdate={translation: currentCount+1}
                            }
                            if(req.body.serverName=="lyricalhunt"){
                                eventToUpdate={lyricalhunt: currentCount+1}
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
    console.log ( req.query.event )
    if(payload.phone_number!="9486030044"){
        console.log ( payload )
        res.json({message: -1});
    }   
    else{
        let filter
        if(req.query.event=='0'){
            filter={tamildebate : 1}
        }
        if(req.query.event=='1'){
            filter={martialarts : 1}
        }
        if(req.query.event=='2'){
            filter={bestmanager : 1}
        }
        if(req.query.event=='3'){
            filter={voiceoflegacy : 1}
        }
        if(req.query.event=='4'){
            filter={musicunplugged: 1}
        }
        if(req.query.event=='5'){
            filter={kavithaigal : 1}
        }
        if(req.query.event=='6'){
            filter={pixie : 1}
        }
        if(req.query.event=='7'){
            filter={yoga: 1}
        }
        if(req.query.event=='8'){
            filter={debateguru : 1}
        }
        if(req.query.event=='9'){
            filter={makeyourmove : 1}
        }
        if(req.query.event=='10'){
            filter={extempore : 1}
        }
        if(req.body.event=='11'){
            filter= {pencilsketching  : 1}
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
    if(payload.phone_number!="9486030044"){
        console.log ( payload )
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
                    let emailList = [];
                    for(let j=0; j<docs[i].participants.length; j++){
                        emailList.push(docs[i].participants[j]["email"]);
                    }
                    let members = await User.find({ email: { $in: emailList } });
                    team["members"] = members;
                    responseData.push(team)
                }
                res.json({message: 1, data: responseData})
            }
        })
    }
})



app.get('/all',authenticateToken, (req,res)=>{
    if(payload.phone_number!="9486030044"){
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


app.get('/getcollegelist', (req,res)=>{
    count.find({},(err,docs)=>{
        if(err) return err
        res.json(docs)
    })
})


// app.post('/sendquery', (req,res)=>{
//     console.log(req.body.queryBox)

//     var transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: 'm.fiesta.db@gmail.com',
//           pass: 'MepcoSchlenk2022'
//         }
//     });
      
//     var mailOptions = {
//         from: 'm.fiesta.db@gmail.com',
//         to: 'kram.cse.2001@gmail.com',
//         subject: 'Legacy Query',
//         text: req.body.queryBox
//     };
      
//     transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });
// })
const port = process.env.PORT || 5000;
app.listen(port,()=>{ console.log("Server @ ",port)})   