var app = angular.module('mittens',['ui.router','ngCookies','ng']);

app.config(function($stateProvider,$urlRouterProvider) {

            $stateProvider
                .state('home', {
                    url: "/", //http://localhost:3000/#/
                    templateUrl: "home.html",
                    controller: "HomeController"
                })

                .state('signup', {
                    url: "/signup",
                    templateUrl: "signup.html",
                    controller: "SignupController"
                })
            });

app.run(function($rootScope,$cookies) {
	if($cookies.get('token') && $cookies.get('currentUser')){
		$rootScope.token = $cookies.get('token');
		$rootScope.currentUser = $cookies.get('currentUser');
	}

});

app.controller('SignupController',function($scope,$http,$state) {
	$scope.CreateNewUser = function() {
		var newUser = {
			username:$scope.username,
		    password:$scope.password
		}
	
		
	$http
	     .post('/users',newUser)
	     .then(function() {
	     	alert('success');
	     });
	     };
});


app.controller('HomeController',['$rootScope','$scope','$http','$cookies',function($rootScope,$scope,$http,$cookies) {

	function init(){
				getAllPosts();
			}

			init();


	$scope.submitNewPost = function() {
		$http
			 .post('/posts',
			 	{newPost:$scope.newPost},
			 	{headers:{'authorization':$rootScope.token}})
			 .then(function() {
				//console.log("success");
				getAllPosts();
			 });    
	}

	$scope.deletePost = function(postId) {
				$http
					.delete("/posts/"+postId,{headers:{'authorization':$rootScope.token}})
					.success(getAllPosts);
			}


		
	$scope.signin = function() {
		$http.post('/users/signin',{username:$scope.username,password:$scope.password})
		     .then(function(res) {
		     	//console.log(res.data.token);
		     	$cookies.put('token',res.data.token);
		     	$cookies.put('currentUser',$scope.username);
		     	$rootScope.token = res.data.token;
		     	$rootScope.currentUser = $scope.username;
		     	alert("Successsfully signed in");
		     },function(err) {
		alert('Bad Login Credentials');
	    });
	}

	$scope.logout = function() {
		$cookies.remove('token');
		$cookies.remove('currentUser');
		$rootScope.token = null;
		$rootScope.currentUser = null;
	}

		function getAllPosts(){
			$http
		       .get('/posts')
		       .success(function(response) {
			console.log(response);
			$scope.posts=response;
		   });			
		 } 
		
}]);