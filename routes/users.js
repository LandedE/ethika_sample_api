var express = require('express');
var router = express.Router();
var Users = require("../models/Users");
var sanitize = require("mongo-sanitize");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Endpoint to create a new user in the database.
router.post('/create_user', function(req, res, next){
  //All user input is sanitized before being sent to MongoDB
  var user_first_name = sanitize(req.body.user_first_name),
    user_last_name = sanitize(req.body.user_last_name),
    user_email = sanitize(req.body.user_email),
    user = new Users({
      email: user_email,
      first_name: user_first_name,
      last_name: user_last_name
    });
  //Above the user object is being created with the ODM Mongoose. The user is then
  //saved below. A response is given according to the outcome of the action.
  user.save(function(err){
    if(err){
      res.send(err);
    }else{
      res.send({code: 200, message: "User Successfully Saved"})
    }
  })
});

//This is the endpoint to search for users
router.get("/search_for_users", function(req, res, next){
  //Again the user input is sanitized before being sent to Mongo.
  var search_term = sanitize(req.query.search_term);
  //If the search term is undefined or an empty string then return entries from the database
  //and limit to 1000. This will help performance at scale by preventing loading in all records.
  if(!search_term || search_term === ""){
    Users.find().limit(1000).exec(function(err, result){
      console.log("search for users result");
      res.send({code: 200, items: result, count: result.length});
    })
  }else{
    //If the search term is an actual string to search by, Mongo will query the database to check
    //if any fields in each record match the search term. At scale this could be a bit costly and it
    //would perhaps be better to search by only one field and to index it. Also there is an assumption made in this solution
    //that by entering a search term we will be filtering enough records to not overload the client
    //and to allow pagination to be handled there. This might not be correct and in the case that the
    //search term does not adequately reduce the number of records passed to the client it might be best to implement
    //pagination such that every time a new page is requested the client makes a request with the page desired
    //as a query parameter. With this information the function here will be able to implement a .skip() command with
    //the argument being page result length * desired page # and also a .limit() command set to the desired page length.
    Users.find({$or: [{"email" : {$regex: search_term}}, {"first_name" : {$regex: search_term}},
    {"last_name" : {$regex: search_term}}]
    }, function(err, result){
      res.send({code: 200, items: result, count: result.length});
    })
  }
})

module.exports = router;
