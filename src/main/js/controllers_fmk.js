'use strict';

var fmkControllers = angular.module('fmkControllers', []);

fmkControllers.constant('AUTH_EVENTS', {
	loginSuccess : 'auth-login-success',
	loginFailure : 'auth-login-failure',
	logoutSuccess : 'auth-logout-success',
	sessionTimeout : 'auth-session-timeout',
	notAuthenticated : 'auth-not-authenticated',
	notAuthorized : 'auth-not-authorized'
});

fmkControllers.constant('KWP_LIST_DATA', {
	firstName : {
		"attr" : "firstName",
		"header" : "First Name"
	},
	lastName : {
		"attr" : "lastName",
		"header" : "Last Name"
	},
	email : {
		"attr" : "email",
		"header" : "E-Mail"
	}
});

fmkControllers
		.controller(
				'LoginController',
				[
						'$scope',
						'$routeParams',
						'$http',
						'AUTH_EVENTS',
						'UserService',
						// '$cookieStore',
						function($scope, $routeParams, $http, AUTH_EVENTS,
								UserService) {

							// if (window.location.protocol == "http:") {
							// var restOfUrl = window.location.href.substr(5);
							// window.location = "https:" + restOfUrl;
							// }

							$scope.credentials = {
								username : $routeParams.username,
								password : ''
							};
							$scope.processing = false;
							$scope.login = function(credentials) {
								$scope.$broadcast("autofill:update");
								$scope.processing = true;
								$scope.loginForm.error = null; // reset
								// messages
								UserService
										.login(credentials)
										.success(
												function(response) {
													if (response.sessionId) {
														window.localStorage
																.setItem(
																		'sessionId',
																		response.sessionId);
														$http.defaults.headers.common.SessionId = response.sessionId;
													}
													$scope
															.$emit(
																	AUTH_EVENTS.loginSuccess,
																	response);
												})
										.error(
												function(errorResponse, status) {
													$scope.processing = false;
													$scope
															.$emit(
																	AUTH_EVENTS.loginFailure,
																	errorResponse);
													$scope.loginForm.error = errorResponse;
												});
							};
							$scope.logout = function() {
								// var cookie =
								// $cookieStore.get('geneticsCookie');
								// if (!cookie) {
								// window.location = "#";
								// return;
								// }
								// UserService
								// .logout($cookieStore.get('geneticsCookie').sessionId)
								UserService
										.logout(
												window.localStorage
														.getItem('sessionId'))
										.success(
												function() {
													window.localStorage
															.removeItem('sessionId');
													$http.defaults.headers.common.SessionId = "";
													$scope
															.$emit(AUTH_EVENTS.logoutSuccess);
												})
										.error(
												function() {
													window.localStorage
															.removeItem('sessionId');
													$http.defaults.headers.common.SessionId = "";
													$scope
															.$emit(AUTH_EVENTS.logoutSuccess);
													window.location = "#";
												});
							};

							$scope.forgottenPassword = function() {
								$scope.$broadcast("autofill:update");
								$scope.processing = true;
								UserService.newUserPassword(
										$scope.credentials.username).success(
										function() {
											$scope.processing = false;
											window.location = "#/login";
										}).error(function() {
									$scope.processing = false;
									window.location = "#";
								});
							};

						} ]);

fmkControllers.controller('RegisterController', [
		'$scope',
		'CommonServices',
		'UserService',
		function($scope, CommonServices, UserService) {
			// $scope.registerForm.$setPristine();
			// window.onload = function() {
			// document.forms.f.q.value = "";
			// };
			$scope.registrationInfo = {
				username : '',
				email : '',
				firstName : '',
				lastName : '',
				password : '',
				password2 : '',
				address : null
			};
			$scope.processing = false;
			$scope.register = function(registrationInfo) {
				// forcing email with username as the username
				// must be the email
				// registrationInfo.email = registrationInfo.username;
				$scope.processing = true;
				UserService.register(registrationInfo).success(function(info) {
					window.location = "#/activation";
				}).error(
						function(errorResponse, status) {
							CommonServices.handleHttpErrorResponse($scope,
									errorResponse, status);
						});
			};
		} ]);

fmkControllers.controller('ActivationController', [
		'$scope',
		'$routeParams',
		'CommonServices',
		'UserService',
		function($scope, $routeParams, CommonServices, UserService) {

			$scope.processing = false;
			$scope.activate = function(key) {
				$scope.processing = true;
				console.log('ActivationController::activate(' + key + ')');
				UserService.activate(key).success(function(info) {
					window.location = "#/login?username=" + info.username;
				}).error(
						function(errorResponse, status) {
							$scope.processing = false;
							CommonServices.handleHttpErrorResponse($scope,
									errorResponse, status);
							$scope.activationForm.error = errorResponse;
						});
			};

			// try to get key from GET request
			// otherwise the user has to enter it

			console.log('ActivationController|key=' + $routeParams.key);

			if ($routeParams.key) {
				$scope.activate($routeParams.key);
			}

		} ]);

fmkControllers.controller('AuthErrorController', [ '$scope', function($scope) {
	// try to initialize with info from cookie
	// $scope.currentUser = $cookieStore.get('currentUser');
} ]);

fmkControllers.controller('AdminController',
		[
				'$scope',
				'$interval',
				'CommonServices',
				'UserService',
				'SessionService',
				function($scope, $interval, CommonServices, UserService,
						SessionService) {

					// Users
					$scope.users = [];

					console.log('$scope.roles=' + $scope.roles);

					var usersListData = [];
					usersListData.push({
						"attr" : "username",
						"header" : "Username",
						"direc" : "user-link"
					});
					// usersListData.push({
					// "attr" : "role",
					// "header" : "Role",
					// "direc" : "userroles-edit",
					// "roles" : $scope.roles
					// });
					usersListData.push({
						"attr" : "firstName",
						"header" : "First name",
						"direc" : "kwp-field-data"
					});
					usersListData.push({
						"attr" : "lastName",
						"header" : "Last name",
						"direc" : "kwp-field-data"
					});
					usersListData.push({
						"attr" : "lSLTMs",
						"header" : "Last login",
						"direc" : "kwp-field-data"
					});
					$scope.usersListData = usersListData;

					$scope.processing = true;
					var refreshUsersList = function() {
						UserService.getAll().success(
								function(resp) {
									$scope.users = resp.allusers;
									$scope.$broadcast("usersRefreshList",
											resp.allusers);
									$scope.processing = false;
								}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
								});
					};
					refreshUsersList();

					$scope.$on('usersRemoveItem', function(event, item,
							callback) {
						UserService.deleteUser(item).success(function(info) {
							refreshUsersList();
						}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
								});
					});

					// Sessions
					$scope.sessions = [];

					var sessionsListData = [];
					sessionsListData.push({
						"attr" : "user.username",
						"header" : "Username",
						"direc" : "session-user-link"
					});
					sessionsListData.push({
						"attr" : "lastTimestamp",
						"header" : "Last timestamp",
						"direc" : "kwp-field-data"
					});
					$scope.sessionsListData = sessionsListData;

					var refreshSessionsList = function() {
						SessionService.getAll().success(
								function(resp) {
									$scope.sessions = resp.allsessions;
									$scope.$broadcast("sessionsRefreshList",
											resp.allsessions);
								}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
								});
					};
					refreshSessionsList();

					$scope.$on('sessionsRemoveItem', function(event, item,
							callback) {
						SessionService.destroy(item).success(function(info) {
							refreshSessionsList();
						}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
								});
					});

					// Auto-refresh
					var autorefreshUsers = $interval(function() {
						refreshUsersList();
						// alert($scope.users.length);
					}, 60 * 1000);
					var autorefreshSessions = $interval(function() {
						refreshSessionsList();
						// alert($scope.users.length);
					}, 10 * 1000);
					$scope.$on('$destroy', function() {
						$interval.cancel(autorefreshUsers);
						$interval.cancel(autorefreshSessions);
					});

				} ]);

fmkControllers.controller('UserProfileController', [ '$scope',
		'CommonServices', function($scope, CommonServices) {

		} ]);

fmkControllers.controller('UserAddressController', [
		'$scope',
		'CommonServices',
		'UserService',
		function($scope, CommonServices, UserService) {

			// uses 'user' as input valus that should be filled
			// with ng-init="user=currentUser"
			// TODO : this is a problem when refreshing the user profile page...
			
			$scope.editing = false;
			$scope.processing = false;
			
			if (!$scope.user)
				$scope.user = $scope.currentUser;

			if ($scope.user.address !== null)
			{
				
				$scope.address = {
					"line1" : $scope.user.address.line1,
					"line2" : $scope.user.address.line2,
					"postalCode" : $scope.user.address.postalCode,
					"town" : $scope.user.address.town,
					"province" : $scope.user.address.province,
					"state" : $scope.user.address.state
				};
			}
			else
			{
				console.log("setting empty address");
				$scope.address = {
					"line1" : "",
					"line2" : "",
					"postalCode" : "",
					"town" : "",
					"province" : "",
					"state" : ""
				};
			}

			$scope.setAddress = function(address) {
				$scope.processing = true;
				UserService.setUserAddress($scope.user.username, address)
						.success(function(resp) {
							$scope.user = resp.user;
							$scope.processing = false;
						}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
									$scope.processing = false;
								});

			};
		} ]);

fmkControllers.controller('ChangePasswordController', [
		'$scope',
		'CommonServices',
		'UserService',
		function($scope, CommonServices, UserService) {

			$scope.credentials = {
				"currentPassword" : "",
				"password" : "",
				"password2" : "",
			};

			if ($scope.tmpPassword) {
				$scope.credentials.currentPassword = $scope.tmpPassword;
			}

			$scope.changePassword = function(credentials) {
				$scope.processing = true;
				UserService.changeUserPassword($scope.user.username,
						credentials.currentPassword, credentials.password)
						.success(function(resp) {
							// $scope.user = resp.user;
							$scope.processing = false;
						}).error(
								function(errorResponse, status) {
									CommonServices.handleHttpErrorResponse(
											$scope, errorResponse, status);
									$scope.processing = false;
								});
			};
		} ]);

fmkControllers.controller('ListController', [
		'$scope',
		'$filter',
		'$interpolate',
		'Pagination',
		function($scope, $filter, $interpolate, Pagination) {

			// Required attributes in $scope :
			// listId : an unique id for the list
			// list : an array with all elements
			// listSize : pagination size
			// orderBy : attribute name of element in list to sort on
			// ...

			// optional
			// searchBy : attribute name of element in list to search on
			// onItemClick : the method to call when an object is clicked

			// var expressionHandler = $scope.onItemClick();

			$scope.itemClick = function(object) {
				$scope.onItemClick({
					item : object
				});
			};

			// alert("$scope.list=" + $scope.list);
			if ($scope.listSize) {
				Pagination.init($scope, $scope.orderBy, $scope.listSize);
			} else {
				Pagination.init($scope, $scope.orderBy, 50);
			}

			$scope.updateFilter = function() {
				var filteredItems = $filter('filter')(
						$scope.list,
						function(item) {
							if (!$scope.searchString) {
								return true;
							}
							var itemSearchByValue = $interpolate(
									"{{" + $scope.searchBy + "}}")(item);
							return itemSearchByValue.toLowerCase().indexOf(
									$scope.searchString.toLowerCase()) !== -1;
						});
				Pagination.updatePage($scope, filteredItems);
			};
			$scope.prevPage = function() {
				Pagination.prevPage($scope);
			};
			$scope.nextPage = function() {
				Pagination.nextPage($scope);
			};
			$scope.sortBy = function(newSortingOrder) {
				Pagination.sortBy($scope, newSortingOrder);
			};
			$scope.setPage = function() {
				Pagination.setPage($scope, this.n);
			};

			$scope.range = function(start, end) {
				var ret = [];
				if (!end) {
					end = start;
					start = 0;
				}
				for (var i = start; i < end; i++) {
					ret.push(i);
				}
				return ret;
			};

			$scope.removeItemCallback = function(list) {
				Pagination.updatePage($scope, list);
			};

			$scope.remove = function(item) {
				$scope.$emit($scope.listId + 'RemoveItem', item,
						$scope.removeItemCallback);
				// $scope.list.splice($scope.list.indexOf(item),
				// 1);
			};

			// alert("$scope.$on:" + $scope.listId +
			// 'RefreshList');
			$scope.$on($scope.listId + 'RefreshList', function(event, list) {
				// console.log('ListController::' + $scope.listId
				// + 'RefreshList called list.length=' + list.length);
				Pagination.updatePage($scope, list);
			});

			// alert("$scope.listSize="+$scope.listSize);
			// alert("$scope.list.length="+$scope.list.length);
			Pagination.updatePage($scope, $scope.list);
		} ]);

fmkControllers.controller('MessagesController', [
		'$scope',
		'$filter',
		'Pagination',
		function($scope, $filter, Pagination) {

			if ($scope.listSize) {
				Pagination.init($scope, $scope.orderBy, $scope.listSize);
			} else {
				Pagination.init($scope, $scope.orderBy, 50);
			}

			$scope.messageFilter = 'ALL';
			$scope.updateFilter = function(level) {
				if ($scope.messageFilter == level) {
					$scope.messageFilter = 'ALL';
				} else {
					$scope.messageFilter = level;
				}
				var filteredItems = $filter('filter')($scope.list,
						function(msg) {
							if ($scope.messageFilter == 'ALL') {
								return true;
							}
							return msg.level == level;
						});
				Pagination.updatePage($scope, filteredItems);
			};
			$scope.prevPage = function() {
				Pagination.prevPage($scope);
			};
			$scope.nextPage = function() {
				Pagination.nextPage($scope);
			};
			$scope.sortBy = function(newSortingOrder) {
				Pagination.sortBy($scope, newSortingOrder);
			};
			$scope.setPage = function() {
				Pagination.setPage($scope, this.n);
			};

			$scope.range = function(start, end) {
				var ret = [];
				if (!end) {
					end = start;
					start = 0;
				}
				for (var i = start; i < end; i++) {
					ret.push(i);
				}
				return ret;
			};

			$scope.$on($scope.listId + 'RefreshList', function(event, list) {
				Pagination.updatePage($scope, list);
			});

			Pagination.updatePage($scope, $scope.list);

			if ($scope.list.length > 0)
				$scope.opened = 'in';
		} ]);

fmkControllers
		.directive(
				'wrapper',
				[
						'$compile',
						function($compile) {
							var directive = {};

							directive.restrict = 'E';

							directive.compile = function(element, attributes) {
								var linkFunction = function($scope, element,
										attributes) {
									element
											.replaceWith($compile(
													"<"
															+ $scope.data.direc
															+ " item='item' data='data' field='data.attr'/>")
													($scope));
								};
								return linkFunction;
							};

							directive.scope = {
								item : "=",
								data : "="
							};

							return directive;
						} ]);

fmkControllers
		.directive(
				'userLink',
				[ function() {
					var directive = {};
					directive.restrict = 'EC';
					directive.template = "<a class='linkElement' href='#/user?username={{user.username}}'>{{user.username}}</a>";
					directive.scope = {
						user : "=item",
					};
					return directive;
				} ]);
fmkControllers
		.directive(
				'sessionUserLink',
				[ function() {
					var directive = {};
					directive.restrict = 'EC';
					directive.template = "<a class='linkElement' href='#/user?id={{session.user.username}}'>{{session.user.username}}</a>";
					directive.scope = {
						session : "=item",
					};
					return directive;
				} ]);

fmkControllers.directive('userrolesEdit',
		[ function() {
			var directive = {};
			directive.restrict = 'EC';

			// directive.template = "<td><img src='img/edit.png'
			// ng-hide='showtooltip'"
			// + "ng-click='toggleTooltip($event)' height='21'/><span "
			// + "ng-hide='showtooltip'>{{user.roles}}</span><span "
			// + "ng-show='showtooltip'><img "
			// + "ng-click='selectedRole=null;toggleTooltip($event)' "
			// + "src='img/close.png' height='21' /><select
			// ng-model='selectedRole' "
			// + "ng-options='o.name as o.name for o in
			// data.roles'></select><div "
			// + "ng-click='addRole()' >+</div><div ng-click='removeRole()'
			// >-</div></span></td> ";
			//					
			directive.template = "test";

			directive.scope = {
				user : "=item",
				data : "="
			};
			directive.controller = function($scope, UserService) {

				console.log('userrolesEditController');

				$scope.selectedRole = null;

				$scope.showtooltip = false;
				// $scope.value = 'Edit me.';

				$scope.hideTooltip = function() {
					$scope.showtooltip = false;
				};

				$scope.toggleTooltip = function(e) {
					e.stopPropagation();
					// alert($scope.user.username);
					console.log('InlineEditorController'
							+ JSON.stringify($scope.user));
					$scope.showtooltip = !$scope.showtooltip;
				};

				$scope.addRole = function() {
					UserService.addUserRole($scope.user.username,
							$scope.selectedRole).success(function(resp) {
						// alert($scope.selectedRole);
						$scope.user = resp.user;
						$scope.showtooltip = false;
					}).error(
							function(errorResponse, status) {
								CommonServices.handleHttpErrorResponse($scope,
										errorResponse, status);
							});
				};
				$scope.removeRole = function() {
					UserService.removeUserRole($scope.user.username,
							$scope.selectedRole).success(function(resp) {
						// alert($scope.selectedRole);
						$scope.user = resp.user;
						$scope.showtooltip = false;
					}).error(
							function(errorResponse, status) {
								CommonServices.handleHttpErrorResponse($scope,
										errorResponse, status);
							});
				};
			};
			return directive;
		} ]);

fmkControllers
		.directive(
				'userroleEdit',
				[ function() {
					var directive = {};
					directive.restrict = 'EC';

					directive.template = "<td><img src='img/edit.png' ng-hide='showtooltip'"
							+ "ng-click='toggleTooltip($event)' height='21'/><span "
							+ "ng-hide='showtooltip'>{{user.role}}</span><span "
							+ "ng-show='showtooltip'><img "
							+ "ng-click='newRole=user.role;toggleTooltip($event)' "
							+ "src='img/close.png' height='21' /><select ng-model='newRole' "
							+ "ng-options='o.name as o.name for o in data.roles'></select><img "
							+ "src='img/save.png' height='21' ng-click='changeRole()' /></span></td> ";
					directive.scope = {
						user : "=item",
						data : "="
					};
					directive.controller = function($scope, UserService) {

						$scope.newRole = $scope.user.role;

						$scope.showtooltip = false;
						// $scope.value = 'Edit me.';

						$scope.hideTooltip = function() {
							$scope.showtooltip = false;
						};

						$scope.toggleTooltip = function(e) {
							e.stopPropagation();
							// alert($scope.user.username);
							console.log('InlineEditorController'
									+ JSON.stringify($scope.user));
							$scope.showtooltip = !$scope.showtooltip;
						};

						$scope.changeRole = function() {
							UserService.addUserRole($scope.user.username,
									$scope.newRole).success(function(resp) {
								// alert($scope.newRole);
								$scope.user = resp.user;
								$scope.showtooltip = false;
							}).error(
									function(errorResponse, status) {
										CommonServices.handleHttpErrorResponse(
												$scope, errorResponse, status);
									});
						};
					};
					return directive;
				} ]);

fmkControllers.controller('ContactMessageController', [
		'$scope',
		'$timeout',
		'CommonServices',
		'ContactMessageService',
		function($scope, $timeout, CommonServices, ContactMessageService) {
			$scope.processing = false;

			$scope.message = {
				"senderName" : "",
				"subject" : "",
				"body" : ""
			};

			var myTimer = null;

			$scope.sendMessage = function(message) {
				$scope.processing = true;
				ContactMessageService.sendMessage(message).success(
						function(resp) {
							$scope.processing = false;
							$scope.messageSent = true;

							myTimer = $timeout(function interval() {
								window.location = "#";
							}, 2000);

						}).error(
						function(errorResponse, status) {
							CommonServices.handleHttpErrorResponse($scope,
									errorResponse, status);
							$scope.processing = false;
						});
			};

			$scope.$on("$destroy", function(event) {
				if (myTimer != null) {
					$timeout.cancel(myTimer);
				}
			});

		} ]);

fmkControllers
		.controller(
				'UploadCtrl',
				[
						'$scope',
						'fileUpload',
						function($scope, fileUpload) {
							$scope.add = function() {
								var file = document
										.getElementById('fileToUpload').files[0], r = new FileReader();
								if (file) {
									var fileSize = 0;
									if (file.size > 1024 * 1024)
										fileSize = (Math.round(file.size * 100
												/ (1024 * 1024)) / 100)
												.toString()
												+ 'MB';
									else
										fileSize = (Math
												.round(file.size * 100 / 1024) / 100)
												.toString()
												+ 'KB';

									$scope.fileName = file.name;
									$scope.fileSize = fileSize;
									$scope.fileType = file.type;
								}

								// r.onloadend = function(e) {
								// var data = e.target.result;
								// // send your binary data via $http or
								// // $resource or do anything else
								// // with it
								// // $scope.file = "toto";
								// alert(data);
								//									
								// };
								// alert(file.name);
								r.readAsArrayBuffer(file);
								// alert("read done");
								fileUpload.uploadFileToUrl(file, 'updwnld');
							};
						} ]);
