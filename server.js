var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jwt-simple'); 
var mongoose = require('mongoose');

var JWT_SECRET ='onestepcloser';

mongoose.connect('mongodb://localhost/db_name');



var PostSchema = mongoose.Schema({
	body: { type: String, required: true },
	username:String,
	posted: { type: Date, default: Date.now }
}, { collection: 'post' });

var UserSchema = mongoose.Schema({
	username: { type: String, required: true },
	password: { type: String, required: true }
}, { collection: 'user' });

var PostModel = mongoose.model("PostModel", PostSchema);
var UserModel = mongoose.model("UserModel", UserSchema);



app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded



app.get('/posts', function getAllPosts(req, res, next) {
	PostModel
		.find()
		.then(function (posts) {
			//console.log(posts);
			res.json(posts);
		},
		function (err) {
			res.sendStatus(400);
		});

});

app.post('/posts', function createPost(req, res, next) {

	var token = req.headers.authorization;
	// console.log(token);
	var user = jwt.decode(token,JWT_SECRET);
	// console.log(user);

	
	var post = {
		body:req.body.newPost,
		user:user._id,
		username:user.username
	};
	
	console.log(post);
	PostModel
		.create(post)
		.then(
		function (postObj) {
			res.json(200);
		},
		function (err) {
			res.sendStatus(400);
		});
});


app.delete("/posts/:id", function deletePost(req, res) {
	var postId = req.params.id;

	var token = req.headers.authorization;
	var user = jwt.decode(token,JWT_SECRET);

	PostModel
		.remove({ _id: postId,username:user.username })
		.then(
		function (status) {
			console.log("one item deleted");
			res.sendStatus(200);
		}, function (err) {
			res.sendStatus(400);
		});

});


app.get("/posts/:id", getPostById);

function getPostById(req, res) {
	var postId = req.params.id;
	PostModel
		.findById({ _id: postId })
		.then(
		function (post) {
			res.json(post);
		},
		function (err) {
			res.sendStatus(400);
		});

}


app.post('/users', function createUser(req, res, next) {
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(req.body.password, salt, function (err, hash) {
			var newUser = {
				username: req.body.username,
				password: hash
			};
			console.log(newUser);
			UserModel
				.create(newUser)
				.then(
				function (postObj) {
					res.json(200);
				},
				function (err) {
					res.sendStatus(400);
				});

		});
	});

});


app.post('/users/signin', function checkUser(req, res, next) {
    console.log("The requested username is "+req.body.username);
	UserModel.findOne({ username: req.body.username }, function (err, user) {
		console.log(req.body);
		bcrypt.compare(req.body.password, user.password, function (err, result) {
			if (result) {
				// encode 
                var token = jwt.encode(user, JWT_SECRET);
				console.log("result found");
				return res.json({token:token});
			} else {
				console.log("Error");
				return res.status(400).send();
			}
		});
	});

});




app.listen(process.env.PORT || 3000,function () {
	console.log("Server listening on port 3000");
});
