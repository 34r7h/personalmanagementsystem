'use strict';
angular.module('irth', ['firebase', 'mm.foundation'])
	.controller('ctrl', function ($scope, $firebase, $firebaseAuth, $location, $window, $timeout) {
		var dbURL = 'https://yourlife.firebaseio.com/users',
			ref = {}, backgroundsRef = {}, sync = {}, backgroundsSync = {}, bind = {}, authRef = new Firebase(dbURL);
		$scope.lifestyle = ['action', 'event', 'fuel', 'train', 'day', 'task', 'note', 'fear', 'love'];

		$scope.lifestyleDescription = {
			action: 'These are things you do',
			event: 'These are things that happen',
			fuel: 'Fuels are anything that you feed yourself',
			train: 'Training is exercise and/or education',
			day: 'Treat the day section as your journal',
			task: 'Tasks are created and updated here',
			fear: 'Express your negative feelings and emotions',
			love: 'Give thanks and praise. You\'re really quite lucky :)'
		};

		$scope.nav = {ALPHA: ['action', 'task'], BETA: ['fuel', 'train'], PHI: ['day', 'event'], OMEGA: ['fear', 'love']};
		$scope.style = {};
		$scope.backgroundsImg = 'images/tracks.jpg'
		$scope.dimensions = {
			minWidth: $window.innerWidth + 'px',
			minHeight: $window.innerHeight + 'px',
			background: 'url(' + $scope.backgroundsImg + ') center center no-repeat fixed',
			backgroundSize: 'cover'
	};

		$scope.style.note = {
			position: 'fixed',
			bottom: 0,
			left: 0,
			minWidth: $window.innerWidth + 'px',
			minHeight: ( $window.innerHeight / 2 ) + 'px',
			width: '100%',
			height: '50%',
			zIndex: 10000,
			background: 'rgba(23,43,12, .62)',
			display:'flex'
		};


		$scope.show = {note: {big: true}};
		$scope.showLinks = {mind: true, body: true, spirit: true};
		$scope.life = [];
		$scope.syncArray = {};
		$scope.syncObject = {};
		$scope.syncBackgroundsObject = {};
		$scope.syncBackgroundsArray = {};
		$scope.bindObject = {};
		$scope.beGone = {};
		$scope.new = {};
		$scope.api = {add: {}};
		$scope.login = {email: '', password: ''};
		$scope.authObj = $firebaseAuth(authRef);
		$scope.location = $location;


		$scope.oAuth = function (provider) {
			$scope.authObj.$authWithOAuthPopup(provider).then(function (authData) {
				$scope.authData = authData;
				console.log("Logged in as:", $scope.authData.uid);
				$scope.getData();
			}).catch(function (error) {
				console.error("Authentication failed:", error);

			});
		};

		$scope.auth = function (email, password) {
			$scope.authObj.$authWithPassword({
				email: email,
				password: password
			}).then(function (authData) {
				$scope.authData = authData;
				console.log("Logged in as:", authData.uid);

				/*var checkRef = $firebase(authRef);
				 var checkData = checkRef.$asObject();
				 if (!checkData[$scope.authData.uid]) {
				 checkData[$scope.authData.uid] = {
				 backgrounds: {
				 welcome: 'http://hivewallpaper.com/wallpaper/2014/12/pablo-picasso-cubism-paintings-9-widescreen-wallpaper.jpg'
				 },
				 life:{
				 task:{
				 welcome: {
				 name: 'Welcome',
				 details: 'create tasks'
				 }
				 }
				 }

				 };
				 console.log(checkData);
				 checkData.$save();
				 };
				 */
				$scope.getData();

			}).catch(function (error) {
				console.error("Authentication failed:", error);
			});
		};
		// $scope.auth('email@?.??','password');


		$scope.register = function (email, password) {
			$scope.authObj.$createUser(email, password).then(function () {
				$scope.auth(email, password);
			});
		};


		// Prepare indexedDb
		/*var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
			IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
			dbVersion = 1;
		console.log('indexedDB', indexedDB);
		var request = indexedDB.open("elephantFiles", dbVersion);
		console.log('indexedDb request', request);
		request.onsuccess = function (event) {
			console.log("Success creating/accessing IndexedDB database");
			var db = request.result;
			db.onerror = function (event) {
				console.log("Error creating/accessing IndexedDB database");
			};
			// Interim solution for Google Chrome to create an objectStore. Will be deprecated
			if (db.setVersion) {
				if (db.version != dbVersion) {
					var setVersion = db.setVersion(dbVersion);
					setVersion.onsuccess = function () {
						createObjectStore(db);
						getImageFile();
					};
				}
				else {
					getImageFile();
				}
			}
			else {
				getImageFile();
			}
		};

// For future use. Currently only in latest Firefox versions
		request.onupgradeneeded = function (event) {
			createObjectStore(event.target.result);
		};*/


		$scope.getData = function () {
			angular.forEach($scope.lifestyle, function (life) {
				$scope.new[life] = {};
				$scope.beGone[life] = 'display:none';
				console.log('$scope.authObj.$getAuth().uid', $scope.authObj.$getAuth().uid);
				ref[life] = $scope.authObj.$getAuth() ?
					new Firebase(dbURL + '/' + $scope.authObj.$getAuth().uid + '/life/' + life) :
					console.log('not signed in');
				sync[life] = $firebase(ref[life]);
				$scope.syncObject[life] = sync[life].$asObject().$loaded().then(function(data){
					// console.log('syncObject data', data);
					// local storage attempt
					/*var localData = JSON.stringify(data);
					localStorage.setItem(life, localData);
					console.log('please be local', localStorage.getItem('localObject['+life+']'))*/
				});
				bind[life] = sync[life].$asObject();
				$scope.syncArray[life] = sync[life].$asArray();
				$scope.bindObject[life] = bind[life].$bindTo($scope, life.toString());
			});

			$scope.backgroundsImg = (function () {
				backgroundsRef = new Firebase(dbURL + '/' + $scope.authObj.$getAuth().uid + '/backgrounds');
				backgroundsSync = $firebase(backgroundsRef);
				$scope.syncBackgroundsObject = backgroundsSync.$asObject();
				$scope.syncBackgroundsArray = backgroundsSync.$asArray();
				// to take an action after the data loads, use the $loaded() promise
				$scope.syncBackgroundsArray.$loaded().then(function () {
					if ($scope.syncBackgroundsArray.length > 0) {
						var randomNum = Math.floor(Math.random() * $scope.syncBackgroundsArray.length);
						// To iterate the key/value pairs of the object, use angular.forEach()
						$scope.backgroundsImg = $scope.syncBackgroundsArray[randomNum].$value
					} else {
						$scope.backgroundsImg = 'images/tracks.jpg';
					}

				});

			})();


			$scope.beGone.action = '';

			//local storage attempt
			/*localStorage.setItem('localArray', $scope.syncArray.toString());
			$scope.localArray = localStorage.getItem('localArray');
			$scope.localObject = localStorage.getItem('localObject');
			console.log($scope.localArray, $scope.localObject);*/
		};
		$scope.authObj.$getAuth() ? ($scope.authData = $scope.authObj.$getAuth(), $scope.getData()) : console.log('no data');
		// Prepare localStorage
		$scope.wut = JSON.parse(localStorage.getItem('$scope.localObject'));
		console.log($scope.wut);


		// API

		angular.forEach($scope.lifestyle, function (section) {
			// Loop through the lifestyle array
			// and create a method on api.add for each section
			$scope.api.add[section] = function (submission) {
				console.log('adding', submission);
				var time = Date.now();
				submission.created = time;
				console.log('sync', sync);
				sync[section].$push(submission);
			};
		});
		$scope.api.add['backgrounds'] = function (url) {
			backgroundsSync.$push(url);
		};
		$scope.removeBackgrounds = function (id) {
			backgroundsSync.$remove(id);
		};

		$scope.removeEntry = function (type, id) {
			console.log('removing', type + ": " + id);
			sync[type].$remove(id);
		};
		sync.note.undefined ? $scope.removeEntry('note', 'undefined') : null;


		$scope.copy = function (entry) {
			return angular.copy(entry);
		};


		$scope.hideAll = function () {
			angular.forEach($scope.lifestyle, function (life) {
				$scope.beGone[life] = 'display:none';
			});
		};

		$scope.completeTask = function (id) {
			var timestamp = Date.now();
			sync.task.$update(id, {done: timestamp});
		};
		$scope.unCompleteTask = function (id) {
			var timestamp = Date.now();
			sync.task.$update(id, {done: false, undone: timestamp});
		};
		$scope.reload = function () {
			$window.location.reload();
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
	.filter('trustAsResourceUrl', ['$sce', function ($sce) {
		return function (val) {
			return $sce.trustAsResourceUrl(val);
		};
	}]).directive('autofocus', ['$document', function($document) {
		return {
			link: function($scope, $element, attrs) {
				setTimeout(function() {
					$element[0].focus();
				}, 200);
			}
		};
	}])
;
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