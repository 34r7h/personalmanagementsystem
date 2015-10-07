'use strict';
angular.module('irth', ['firebase','mm.foundation'])
.controller('ctrl', function($scope, $firebase, $firebaseAuth, $location, $window, $timeout){
	var dbURL = 'https://yourlife.firebaseio.com/',
	ref = {}, backgroundsRef={}, sync = {}, backgroundsSync = {}, bind = {}, authRef = new Firebase(dbURL);
	$scope.lifestyle = [ 'action', 'event', 'fuel', 'train', 'day', 'task', 'note', 'fear', 'love'];
	$scope.nav = {ALPHA:['action', 'task'], BETA:['fuel', 'train'], PHI:['day', 'event'], OMEGA:['fear', 'love']};
	$scope.style = {};
	$scope.style.note = {position:'fixed', bottom: 0, left:0, width:$window.innerWidth+'px', height:( $window.innerHeight / 2 )+'px', zIndex:10000, background:'rgba(23,43,12, .62)'};
	$scope.show = {note:{big:true}};
	$scope.showLinks = {mind:true,body:true,spirit:true};
	$scope.life = [];
	$scope.syncArray = {};
	$scope.syncObject = {};
	$scope.syncBackgroundsObject = {};
	$scope.syncBackgroundsArray = {};
	$scope.bindObject = {};
	$scope.beGone = {};
	$scope.new = {};
	$scope.api = {add:{}};
	$scope.login = {email:'',password:''};
	$scope.authObj = $firebaseAuth(authRef);
	$scope.location = $location;
	$scope.auth = function(email, password){
		$scope.authObj.$authWithPassword({
			email: email,
			password: password
		}).then(function(authData) {
			$scope.authData = authData;
			console.log("Logged in as:", authData.uid);
			$scope.getData();

		}).catch(function(error) {
			console.error("Authentication failed:", error);
		});

	};
	$scope.auth('i@o.io','o');
	$scope.dimensions = {minWidth:$window.innerWidth+'px', minHeight:$window.innerHeight+'px'};
		
	
	$scope.getData = function(){
		angular.forEach($scope.lifestyle, function(life){
			$scope.new[life]={};
			$scope.beGone[life] = 'display:none';
			ref[life] = new Firebase(dbURL + '/irth/' + life);
			sync[life] = $firebase(ref[life]);
			$scope.syncObject[life] = sync[life].$asObject();
			bind[life] = sync[life].$asObject();
			$scope.syncArray[life] = sync[life].$asArray();
			$scope.bindObject[life] = bind[life].$bindTo($scope, life.toString());
		});
		
		$scope.backgroundsImg = (function(){
			backgroundsRef = new Firebase(dbURL + '/irth/backgrounds');
			backgroundsSync = $firebase(backgroundsRef);
			$scope.syncBackgroundsObject = backgroundsSync.$asObject();
			$scope.syncBackgroundsArray = backgroundsSync.$asArray();
		     // to take an action after the data loads, use the $loaded() promise
		     $scope.syncBackgroundsArray.$loaded().then(function() {
		     	var randomNum = Math.floor(Math.random()*$scope.syncBackgroundsArray.length);
		       // To iterate the key/value pairs of the object, use angular.forEach()
       		    $scope.backgroundsImg = $scope.syncBackgroundsArray[randomNum].$value;
		     });

		})();


		$scope.beGone.action = '';

	};
	$scope.getData();

		// API

	angular.forEach($scope.lifestyle, function(section){
		// Loop through the lifestyle array
		// and create a method on api.add for each section
		$scope.api.add[section] = function(submission) {
			console.log('adding', submission);
			var time = Date.now();
			submission.created = time;
			sync[section].$push(submission);
		};
	});
	$scope.api.add['backgrounds'] = function(url){
		backgroundsSync.$push(url);
	};
	$scope.removeBackgrounds = function(id) {
		backgroundsSync.$remove(id);
	};

	$scope.removeEntry = function(type, id) {
		console.log( 'removing', type + ": " + id );
		sync[type].$remove(id);
	};

	$scope.copy = function(entry) {
		return angular.copy(entry);
	};



	$scope.hideAll = function () {
		angular.forEach($scope.lifestyle, function(life){
			$scope.beGone[life] = 'display:none';
		});
	};

	$scope.completeTask = function(id) {
		var timestamp = Date.now();
		sync.task.$update(id, {done:timestamp });
	};
	$scope.unCompleteTask = function(id) {
		var timestamp = Date.now();
		sync.task.$update(id, {done:false, undone:timestamp});
	};

/**
// Local storage start ($window.TEMPORARY can be switched with $window.PERMANENT)
		$scope.cLifestyle = [{name:'action', models:{name: new String(), time: new Number(), details: new String(), tags: new Array() }, methods:{create:$scope.addAction}}];
		function onInitFs(fs) {
  			console.log('Opened file system: ' + fs.name);
		}
		var fs = $window.webkitRequestFileSystem($window.TEMPORARY, 800000000, onInitFs);
		console.log('filesystem',fs);
**/
	})
.filter('trustAsResourceUrl', ['$sce', function($sce) {
	return function(val) {
		return $sce.trustAsResourceUrl(val);
	};
}]);
/*
.filter('searchResults', function($firebase){
	return function(entries, search) {
		var results = [];
		console.log('search', search);
		console.log('entry', entries);
		var searchable = entries.$asArray();
		searchable.$filter();
		angular.forEach(entries, function(entry){
			if(search === entry) {
				console.log('value allowed',entry);
				results.push(entry)
			}
		});
		return results;
	}
});
*/