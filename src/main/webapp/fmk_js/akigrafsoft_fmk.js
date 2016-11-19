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

			if (!$scope.user)
				$scope.user = $scope.currentUser;

			$scope.address = {
				"addressLine1" : $scope.user.address.addressLine1,
				"addressLine2" : $scope.user.address.addressLine2,
				"postalCode" : $scope.user.address.postalCode,
				"town" : $scope.user.address.town,
				"province" : $scope.user.address.province,
				"state" : $scope.user.address.state
			};

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

'use strict';

var fmkDirectives = angular.module('fmkDirectives', [ 'fmkServices' ]);

// controller :
// $scope.names = ["john", "bill", ... ];
// html :
// <div ng-controller='DefaultCtrl'>
// <input auto-complete kwp-auto-complete-items="names" ng-model="selected">
// selected = {{selected}}
// </div>
// REQUIRES jquery-ui.min
fmkDirectives.directive('kwpAutoComplete', [
		'$timeout',
		function($timeout) {
			return {
				controller : [
						'$scope',
						'$element',
						'$attrs',
						function(scope, element, attrs) {
							console.log('kwpAutoComplete:'
									+ attrs.kwpAutoCompleteItems);
							console.log('kwpAutoComplete:'
									+ scope[attrs.kwpAutoCompleteItems]);

							var fakedata = [ 'test1', 'test2', 'test3',
									'test4', 'ietsanders' ];

							// scope[attrs.kwpAutoCompleteItems]

							element.autocomplete({
								source : fakedata
							});

							// element.autocomplete({
							// source : fakedata,
							// select : function() {
							// $timeout(function() {
							// element.trigger('input');
							// }, 0);
							// }
							// });
						} ]
			};
		} ]);

fmkDirectives
		.directive(
				'kwpPwCheck',
				[ function() {
					return {
						require : 'ngModel',
						link : function(scope, elm, attr, ctrl) {
							var pwdWidget = elm
									.inheritedData('$formController')[attr.kwpPwCheck];

							ctrl.$parsers.push(function(value) {
								if (value === pwdWidget.$viewValue) {
									ctrl.$setValidity('pwdMatch', true);
									return value;
								}
								ctrl.$setValidity('pwdMatch', false);
							});

							pwdWidget.$parsers.push(function(value) {
								ctrl.$setValidity('pwdMatch',
										value === ctrl.$viewValue);
								return value;
							});
						}
					};
				} ]);

fmkDirectives.directive('kwpUserExists', [
		'CommonServices',
		'UserService',
		function(CommonServices, UserService) {
			return {
				require : 'ngModel',
				link : function(scope, elem, attrs, ctrl) {
					elem.on('blur', function(evt) {
						console.log("kwpUserExists::blur " + evt);
						scope.$apply(function() {
							var val = elem.val();
							var req = {
								"username" : val,
							};
							UserService.exists(req).success(
									function(response) {
										console.log("kwpUserExists::exists "
												+ response.exists);
										// === "0" ? false : true
										// set validity to true means setting
										// $error to false
										ctrl.$setValidity('user',
												!response.exists);
									}).error(
									function(errorResponse, status) {
										CommonServices.handleHttpErrorResponse(
												$scope, errorResponse, status);
									});
						});
					});
				}
			};
		} ]);

// kwp-custom-directive
fmkDirectives.directive('kwpCustomDirective', [
		'$compile',
		function($compile) {
			return {
				restrict : 'E',
				//transclude : true,
				// Let directive have access to parent scope :
				scope : false,
				link : function(scope, element, attr) {
					console.log('kwpCustomDirective::link type=' + attr.type
							+ ',attributes=' + attr.attributes);

					var template = '<div ' + attr.type;
					if (attr.attributes)
						template += ' ' + attr.attributes
					template += ' ></div>';

					var el = $compile(template)(scope);
					// console.log('kwpCustomDirective:'+JSON.stringify(linkFn));
					// el.linkFn(scope);
					// var element = linkFn(scope);
					element.append(el);
				}
			};
		} ]);

fmkDirectives.directive("kwpAutoFill", [ function() {
	return {
		require : "ngModel",
		link : function(scope, element, attrs, ngModel) {
			scope.$on("autofill:update", function() {
				// alert("auto-fill");
				ngModel.$setViewValue(element.val());
			});
		}
	};
} ]);

/**
 * A generic confirmation for risky actions. Usage: Add attributes: *
 * kwp-confirm-message="Are you sure?" * ng-confirm-click="takeAction()"
 * function *
 * kwp-confirm-condition="mustBeEvaluatedToTrueForTheConfirmBoxBeShown"
 * expression
 */
fmkDirectives.directive('kwpConfirmClick', [ function() {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			element.bind('click', function() {
				var condition = scope.$eval(attrs.kwpConfirmCondition);
				if (condition) {
					var message = attrs.kwpConfirmMessage;
					if (message && confirm(message)) {
						scope.$apply(attrs.kwpConfirmClick);
					}
				} else {
					scope.$apply(attrs.kwpConfirmClick);
				}
			});
		}
	};
} ]);

// fmkDirectives
// .directive(
// 'kwpList',
// [ function() {
// var directive = {};
// directive.restrict = 'E';
// directive.template = "<a class='linkElement'
// href='#/user?id={{user.username}}'>{{user.username}}</a>";
// directive.scope = {
// listId : '@',
// list : '@',
// listData : '@',
// listSize : '@',
// listLayout : '@',
// allowRemove : '@',
// orderBy : '@',
// searchBy : '@'
// };
// directive.controller = function($scope, $compile, $http) {
// // $scope is the appropriate scope for the directive
// this.addChild = function(nestedDirective) {
// // this refers to the controller
// console
// .log('kwpList::addChild Got the message from nested directive:'
// + nestedDirective.message);
// };
// };
// return directive;
// } ]);

fmkDirectives
		.directive(
				'kwpUpload',
				[
						'CommonServices',
						function(CommonServices) {
							var directive = {};
							directive.restrict = 'E';
							directive.replace = true;
							directive.template = "<div class='row'>"
									+ "<span class='col-md-4 btn btn-success fileinput-button'>"
									+ "<i class='glyphicon glyphicon-upload'></i>&nbsp;"
									+ " <span>{{uploadBtnName}}</span>"
									+ " <input type='file' id='fileToUpload' name='fileToUpload' ng-disabled='percentCompleted>0'><img ng-show='percentCompleted>0' class='inprogress' src='fmk_img/processing.gif' /></input>"
									+ "</span>"
									+ "<div ng-if='percentCompleted>0' class='progress col-md-8'>"
									+ "<div class='progress-bar' role='progressbar' aria-valuenow='{{percentCompleted}}' aria-valuemin='0' aria-valuemax='100' style='width: {{percentCompleted}}%;'>"
									+ "{{percentCompleted}}%</div>" + "</div>"
									+ "</div>";
							directive.scope = {
								uploadBtnName : '@',
								uploadUrl : '@',
								onUploaded : '&'
							};

							directive.link = function(scope, element, attrs) {
								scope.percentCompleted = -1;

								if (!scope.uploadBtnName)
									scope.uploadBtnName = "Upload file...";

								var uploadFile = function() {
									// retrieve the input element
									var btn_input = element
											.find('#fileToUpload')[0];
									scope.files = [];
									for (var i = 0; i < btn_input.files.length; i++) {
										scope.files.push(btn_input.files[i]);
									}

									var file = scope.files[0], r = new FileReader();
									r.readAsArrayBuffer(file);

									var fd = new FormData();
									fd.append("file", file);

									var xhr = new XMLHttpRequest();

									scope.$apply(function() {
										scope.percentCompleted = 0;
									});

									xhr.upload.onprogress = function(e) {
										if (e.lengthComputable) {
											scope
													.$apply(function() {
														scope.percentCompleted = Math
																.round(e.loaded
																		/ e.total
																		* 100);
													});
											// if (scope.percentCompleted < 1) {
											// } else if (scope.percentCompleted
											// == 100)
											// {} else {}
										}
									};

									xhr.upload.onload = function(e) {
										// Event listener for when the file
										// completed uploading
										scope.$apply(function() {
											scope.percentCompleted = -1;
											// setTimeout(function() {
											// $scope.$apply(function() {
											// $scope.files[i].uploadStatus =
											// '';
											// });
											// }, 4000);
										});
									};

									// console.log('URL=' + HTTP_ROOT +
									// scope.uploadUrl);

									xhr.open('POST', HTTP_ROOT
											+ scope.uploadUrl);
									// xhr.overrideMimeType("application/json");
									xhr.setRequestHeader('SessionId',
											window.localStorage
													.getItem('sessionId'));

									xhr.onreadystatechange = function(aEvt) {
										if (xhr.readyState == 4) {
											if (xhr.status == 200) {
												// console
												// .log('kwpUpload::onreadystatechange:xhr.responseText='
												// + xhr.responseText);
												if (scope.onUploaded) {
													scope
															.onUploaded(JSON
																	.parse(xhr.responseText));
												}
											} else {
												console
														.log('kwpUpload::onreadystatechange error');
												CommonServices
														.handleHttpErrorResponse(
																scope,
																"onreadystatechange",
																xhr.status);
											}
										}
									};

									xhr.send(fd);
								};

								element.bind('change', uploadFile); // .find('fileToUpload')
							};

							return directive;
						} ]);

fmkDirectives.directive('kwpBackButton', function() {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			element.bind('click', goBack);
			function goBack() {
				history.back();
				scope.$apply();
			}
		}
	};
});

fmkDirectives.directive('kwpDraggable', function() {
	return {
		scope : {
			kwpDraggableItem : '@',
			kwpParentId : '@',
			kwpToggleDragging : '&',
		},
		link : function(scope, element) {
			// this gives us the native JS object
			var el = element[0];

			el.draggable = true;

			el.addEventListener('dragstart', function(e) {
				e.dataTransfer.effectAllowed = 'move';
				var container = {
					object : scope.kwpDraggableItem,
					parentId : scope.kwpParentId
				};
				e.dataTransfer.setData('Text', JSON.stringify(container));
				this.classList.add('drag');
				if (scope.kwpToggleDragging)
					scope.kwpToggleDragging({
						dragging : true
					});

				// scope.$apply(function() {
				// scope.kwpDragging = true;
				// });

				return false;
			}, false);

			el.addEventListener('dragend', function(e) {
				this.classList.remove('drag');
				// scope.$apply('kwpOnDrop(' + scope.draggedItem + ')');
				if (scope.kwpToggleDragging)
					scope.kwpToggleDragging({
						dragging : false
					});
				return false;
			}, false);
		}
	};
});

fmkDirectives.directive('kwpDroppable', function() {
	return {
		scope : {
			kwpOnDrop : '&' // parent scope value
		},
		link : function(scope, element) {
			// again we need the native object
			var el = element[0];

			el.addEventListener('dragover', function(e) {
				e.dataTransfer.dropEffect = 'move';
				// allows us to drop
				if (e.preventDefault)
					e.preventDefault();
				this.classList.add('over');
				return false;
			}, false);

			el.addEventListener('dragenter', function(e) {
				this.classList.add('over');
				return false;
			}, false);

			el.addEventListener('dragleave', function(e) {
				this.classList.remove('over');
				return false;
			}, false);

			el.addEventListener('drop', function(e) {
				// Stops some browsers from redirecting.
				if (e.preventDefault)
					e.preventDefault();
				if (e.stopPropagation)
					e.stopPropagation();

				this.classList.remove('over');

				// var l_item = document.getElementById(e.dataTransfer
				// .getData('Text'));
				var container = JSON.parse(e.dataTransfer.getData('Text'));

				if (el.id === container.parentId) {
					console.log("kwpDroppable::drop Cannot drop on parent");
					return false;
				}

				// this.appendChild(item);

				// call the drop passed drop function
				// scope.$apply('kwpOnDrop('+scope.draggedItem+')');

				if (scope.kwpOnDrop)
					scope.kwpOnDrop({
						object : JSON.parse(container.object)
					});

				return false;
			}, false);
		}
	};
});

fmkDirectives.directive('kwpAnimateOnChange', [
		'$animate',
		function($animate) {
			return {
				controller : [
						'$scope',
						'$element',
						'$attrs',
						function($scope, $element, $attrs) {
							$scope.$watch($attrs.kwpAnimateOnChange, function(
									nv, ov) {
								// console.log('kwpAnimateOnChange(' + nv + ','
								// + ov + ')');
								if (nv != ov) {
									var c = $attrs.kwpAnimateOnChangeClass;
									$animate.addClass($element, c, function() {
										$animate.removeClass($element, c);
									});
								}
							});

						} ]
			};
		} ]);

fmkDirectives
		.directive(
				'kwpFieldData',
				[
						'$interpolate',
						function($interpolate) {
							var directive = {};

							directive.restrict = 'E';
							// directive.restrict = 'EC'

							directive.compile = function(element, attributes) {
								var linkFunction = function($scope, element,
										attributes) {
									// var context = {
									// item : $scope.item
									// };
									// alert($scope.item + " " + $scope.field);
									var expr = $interpolate(
											"{{item." + $scope.data.attr + "}}")
											($scope);
									element.html(expr);
								};
								return linkFunction;
							};

							directive.scope = {
								item : "=",
								data : "=",
							};

							return directive;
						} ]);

'use strict';

var fmkFilters = angular.module('fmkFilters', []);

fmkFilters.filter('kwpUpperCaseFirstThenLower', [
		'$filter',
		function($filter) {
			return function(input) {
				return (!!input) ? input.charAt(0).toUpperCase()
						+ input.substr(1).toLowerCase() : '';
			}
		} ]);

fmkFilters.filter('kwpUpperCase', [ '$filter', function($filter) {
	return function(input) {
		return (!!input) ? input.toUpperCase() : '';
	}
} ]);

fmkFilters.filter('kwpCharAt', [ '$filter', function($filter) {
	return function(input, index) {
		return (!!input) ? input.charAt(index) : '';
	}
} ]);

fmkFilters.filter('kwpNoSpace', [ '$filter', function() {
	return function(value) {
		return (!value) ? '' : value.replace(/ /g, '');
	}
} ]);

fmkFilters.filter('kwpRemoveSpecialChars', [
		'$filter',
		function($filter) {
			return function(input) {
				var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
				for (var i = 0; i < specialChars.length; i++) {
					input = input.replace(new RegExp("\\" + specialChars[i],
							'gi'), '');
				}
				return input;
			};
		} ]);

fmkFilters.filter('kwpSplit', [ '$filter', function($filter) {
	return function(input, splitChar, splitIndex) {
		// do some bounds checking here to ensure it has that index
		return input.split(splitChar)[splitIndex];
	};
} ]);

fmkFilters.filter('percentage', [ '$filter', function($filter) {
	return function(input, decimals) {
		var value = parseFloat($filter('number')(input * 100, decimals));
		var string = value.toString(); // removes trailing 0
		return string + '%';
	};
} ]);
'use strict';

var fmkServices = angular.module('fmkServices', [ 'ngResource' ]);

fmkServices
		.factory(
				'CommonServices',
				[
						// '$rootScope',
						'$http',
						'AUTH_EVENTS',
						function($http, AUTH_EVENTS) {
							return {
								handleHttpErrorResponse : function(scope,
										errorResponse, status) {
									switch (status) {
									case 400:
										// Bad Request
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", Bad Request");
										window.location = "#/internal_error";
										break;
									case 403:
										// Forbidden
										// window.localStorage.removeItem('sessionId');
										// $http.defaults.headers.common.SessionId
										// = "";
										scope.$emit(AUTH_EVENTS.notAuthorized);
										// As we have emitted an event, do not
										// force a
										// window.location and let
										// implementation decide
										break;
									case 408:
										// SC_REQUEST_TIMEOUT
										// force reload
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", REQUEST_TIMEOUT: "
														+ errorResponse.errorReason);
										location.reload();
										break;
									case 412:
										// Precondition failed
										// stay on same page
										// and let the application handle the
										// error so don't do anything !
										// alert(errorResponse.errorReason);
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", Server Precondition failed : "
														+ errorResponse.errorReason);

										// if (errorResponse.errorCode === 50) {
										// location.reload();
										// }
										break;
									case 419:
										// 419 Authentication Timeout (not in
										// RFC 2616)
										// Not a part of the HTTP standard, 419
										// Authentication Timeout denotes that
										// previously valid authentication has
										// expired.
										// It is used as an alternative to 401
										// Unauthorized in order to
										// differentiate from
										// otherwise authenticated clients being
										// denied
										// access to specific server resources
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", Authentication/Session timeout : "
														+ errorResponse.errorReason);
										window.localStorage
												.removeItem('sessionId');
										$http.defaults.headers.common.SessionId = "";
										scope.$emit(AUTH_EVENTS.sessionTimeout);
										// location.reload();
										break;
									case 500:
										// Internal server error
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", Internal Server Error, reason :"
														+ errorResponse.errorReason);
										window.location = "#/internal_error";
										break;
									default:
										console
												.log("fmkServices/CommonServices::handleHttpErrorResponse HTTP status "
														+ status
														+ ", Default, reason :"
														+ errorResponse.errorReason);
										window.location = "#/internal_error";
										break;
									}
								}
							};
						} ]);

fmkServices.factory('ConfigurationServices', [ '$http', 'AUTH_EVENTS',
		function($http, AUTH_EVENTS) {
			return {
				getConfiguration : function() {
					return $http.get(HTTP_ROOT + 'configuration');
				},
				getUniqueId : function() {
					return $http.get(HTTP_ROOT + 'configuration/uniqueid');
				}
			};
		} ]);

fmkServices.factory('SessionService', [ '$http', function($http) {
	return {
		getAll : function() {
			return $http.get('sessions');
		},
		destroy : function(session) {
			return $http({
				method : 'DELETE',
				url : HTTP_ROOT + 'sessions/' + session.id
			});
		}
	};
} ]);

fmkServices.factory('ContactMessageService', [ '$http', function($http) {
	return {
		sendMessage : function(message) {
			return $http.post(HTTP_ROOT + 'contactmessage', message);
		}
	};
} ]);

fmkServices
		.factory(
				'Pagination',
				[
						'$filter',
						function($filter) {
							var groupToPages = function(scope) {
								scope.pagedItems = [];
								if (!scope.allItems) {
									return;
								}
								for (var i = 0; i < scope.allItems.length; i++) {
									if (i % scope.itemsPerPage === 0) {
										scope.pagedItems[Math.floor(i
												/ scope.itemsPerPage)] = [ scope.allItems[i] ];
									} else {
										scope.pagedItems[Math.floor(i
												/ scope.itemsPerPage)]
												.push(scope.allItems[i]);
									}
								}
							};
							var sort_items = function(scope) {
								scope.allItems = $filter('orderBy')(
										scope.allItems, scope.sortingOrder,
										scope.reverse);
							};

							return {
								init : function(scope, sortingKey, itemsPerPage) {
									scope.sortingOrder = sortingKey;
									scope.reverse = false;
									scope.allItems = [];
									scope.groupedItems = [];
									scope.itemsPerPage = itemsPerPage;
									scope.pagedItems = [];
									scope.currentPage = 0;
								},
								updatePage : function(scope, items) {
									scope.allItems = items;
									// take care of the sorting order
									if (scope.sortingOrder !== '') {
										sort_items(scope);
									}
									scope.currentPage = 0;
									// now group by pages
									groupToPages(scope);
								},
								// change sorting order
								sortBy : function(scope, newSortingOrder) {
									scope.reverse = !scope.reverse;
									scope.sortingOrder = newSortingOrder;
									sort_items(scope);
									groupToPages(scope);
								},
								prevPage : function(scope) {
									if (scope.currentPage > 0) {
										scope.currentPage--;
									}
								},
								nextPage : function(scope) {
									if (scope.currentPage < scope.pagedItems.length - 1) {
										scope.currentPage++;
									}
								},
								setPage : function(scope, pageNumber) {
									scope.currentPage = pageNumber;
								}
							};
						} ]);

fmkServices.factory('FileUpload', [ '$http', function($http) {
	return {
		uploadFileToUrl : function(file, uploadUrl) {
			var fd = new FormData();
			fd.append("file", file);
			return $http.post(HTTP_ROOT + uploadUrl, fd, {
				transformRequest : angular.identity,
				headers : {
					'Content-Type' : undefined
				}
			});
		}
	};
} ]);

fmkControllers.controller('UserController', [
		'$scope',
		'$filter',
		'$routeParams',
		'$location',
		'CommonServices',
		'UserService',
		function($scope, $filter, $routeParams, $location, CommonServices,
				UserService) {

			var username = $routeParams.username;
			$scope.username = username;

			$scope.processing = true;
			UserService.getUserByUsername(username).success(function(resp) {
				$scope.user = resp;
				$scope.processing = false;
			}).error(
					function(errorResponse, status) {
						CommonServices.handleHttpErrorResponse($scope,
								errorResponse, status);
						$scope.processing = false;
					});

			$scope.addRole = function() {
				console.log('addRole(' + $scope.selectedRole.name + ')');
				UserService.addUserRole(username, $scope.selectedRole.name)
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
			$scope.removeRole = function() {
				console.log('removeRole(' + $scope.selectedRole.name + ')');
				UserService.removeUserRole(username, $scope.selectedRole.name)
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

fmkDirectives
		.directive(
				'kwpServerPagedList',
				[ function() {
					var directive = {};
					directive.restrict = 'E';
					directive.templateUrl = "./fmk_include/serverpagination.html";
					directive.scope = {
						parentId : '@',
						listTitle : '@',
						listTitleAdmin : '=',
						listFactory : '@',
						listFactoryParams : '@',
						listName : '@',
						listId : '@',
						listUri : '@',
						listData : '=',
						pageSize : '@',
						listLayout : '@',
						allowLayoutToggle : '=',
						itemsGridDirective : '@',
						itemsTableDirective : '@',
						listSearchDirective : '@',
						// allows to pass parameters to sub-directive
						listSearchParams : "=",
						listAddEnabled : "=",
						listAddDirective : '@',
						// allows to pass parameters to sub-directive
						listAddParams : "=",
						orderBy : '@',
						orderReverse : '=',
						searchCriteriasBase : '=',
						searchCriterias : '=',
						opened : '@',
						onItemClick : '&',
						allowRemove : '=',
						allowDrop : '=',
						onListModified : '&',
						listParam : '@'
					};

					directive.controller = [
							'$scope',
							'$element',
							'$attrs',
							'$http',
							'PagedListsService',
							'CommonServices',
							function($scope, $element, $attrs, $http,
									PagedListsService, CommonServices) {
								// $attrs contain attributes not interpolated,
								// while $scope are

								console
										.log("kwpServerPagedList[listAddEnabled="
												+ $scope.listAddEnabled
												+ ",listAddDirective="
												+ $scope.listAddDirective + "]");

								$scope.displayAction = '';

								var searchCriterias = {};
								if (typeof ($scope.searchCriterias) !== 'undefined')
									searchCriterias = $scope.searchCriterias;

								// $scope.searchCriterias.name = "";

								var l_pageSizeNumber = Number($attrs.pageSize);

								// Initialize the hash storing reverse status
								// for possible sorting orderBys
								$scope.orderReverseHash = {};
								if ((typeof ($scope.orderBy) !== 'undefined')
										&& (typeof ($attrs.orderReverse) !== 'undefined')) {
									$scope.orderReverseHash[$scope.orderBy] = $attrs.orderReverse;
								} else {
									$scope.orderReverseHash[$scope.orderBy] = false;
								}

								$scope.itemDragging = false;
								$scope.setItemDragging = function(dragging) {
									// console.log('setItemDragging(' + dragging
									// + ')');
									$scope.$apply(function() {
										$scope.itemDragging = dragging;
									});
								};

								// var myService = $injector
								// .get($attrs.listService);

								var udpdateFromSuccessResponse = function(
										response) {
									if (response.sessionId)
										// see Comment0
										$http.defaults.headers.common.SessionId = response.sessionId;

									$scope.paged = response.paged;
									$scope.items = response.items;
									if ($scope.itemsFullSize != response.itemsFullSize) {
										$scope.onListModified();
									}
									$scope.itemsFullSize = response.itemsFullSize;
									$scope.itemsFilteredSize = response.itemsFilteredSize;
									$scope.currentPage = Math
											.ceil(response.fromIndex
													/ l_pageSizeNumber);
									$scope.nbPages = Math
											.ceil($scope.itemsFilteredSize
													/ l_pageSizeNumber);
								};

								var doUpdateList = function(from) {
									console
											.log("kwpServerPagedList.doUpdateList("
													+ $scope.listId + ")");
									var fromIndex = $scope.currentPage
											* l_pageSizeNumber;
									PagedListsService
											.updateList($scope.listUri,
													$scope.listId, from,
													fromIndex, l_pageSizeNumber)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								};

								$scope.addItem = function(itemId, item) {
									console.log("kwpServerPagedList::addItem("
											+ itemId + ","
											+ JSON.stringify(item) + ")");

									delete $scope.errorReason;

									PagedListsService
											.addItem($scope.listUri,
													$scope.listId, itemId, item)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);

														if (response.done === true) {
															$scope.displayAction = '';
														} else {
															$scope.errorReason = response.errorReason;
														}
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								}

								$scope.onAdd = function(object) {
									console.log("kwpServerPagedList.onAdd("
											+ $scope.listId + ")");
									if (object.listId) {
										doUpdateList(object);
									} else {
										var fromIndex = $scope.currentPage
												* l_pageSizeNumber;
										PagedListsService
												.addItem($scope.listUri,
														$scope.listId,
														object.id, object)
												.success(
														function(response) {
															udpdateFromSuccessResponse(response);
														})
												.error(
														function(errorResponse,
																status) {
															CommonServices
																	.handleHttpErrorResponse(
																			$scope,
																			errorResponse,
																			status);
														});
									}
								};

								if ($scope.allowRemove)
									$scope.onRemove = function(object) {
										console
												.log('kwpServerPagedList::onRemove('
														+ JSON
																.stringify(object)
														+ ')');

										if (object.listId) {
											console.log('onRemove(listId='
													+ object.listId + ')');
											object.remove = true;
											doUpdateList(object);
										} else {
											// TODO ? we should pass the whole
											// object because we cannot know
											// about 'id'
											// and this should be a POST method

											// console.log('onRemove object<'
											// + object.id + '>');

											PagedListsService
													.removeItem($scope.listUri,
															$scope.listId,
															object.id)
													.success(
															function(response) {
																udpdateFromSuccessResponse(response);
															})
													.error(
															function(
																	errorResponse,
																	status) {
																CommonServices
																		.handleHttpErrorResponse(
																				$scope,
																				errorResponse,
																				status);
															});
										}
									};

								/*
								 * Comment0: getPage, orderBy and sortBy can
								 * respond with a sessionId that will need to be
								 * provided for further If sessionId was already
								 * provided and session was still valid on the
								 * server then same value shall be returned so
								 * no problem to override
								 */

								var getPage = function(fromIndex) {
									PagedListsService
											.getPage($scope.listUri,
													$scope.listId, fromIndex,
													l_pageSizeNumber)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								};
								this.getPage = getPage;

								$scope.prevPage = function() {
									if ($scope.currentPage > 0) {
										getPage(($scope.currentPage - 1)
												* l_pageSizeNumber);
									}
								};
								$scope.nextPage = function() {
									if ($scope.currentPage < ($scope.nbPages - 1)) {
										getPage(($scope.currentPage + 1)
												* l_pageSizeNumber);
									}
								};

								$scope.sortBy = function(newOrderBy) {
									$scope.orderBy = newOrderBy;
									if (typeof ($scope.orderReverseHash[$scope.orderBy]) !== 'undefined') {
										$scope.orderReverseHash[$scope.orderBy] = !$scope.orderReverseHash[$scope.orderBy];
									} else
										$scope.orderReverseHash[$scope.orderBy] = false;
									var fromIndex = Math
											.ceil($scope.currentPage
													* l_pageSizeNumber);
									PagedListsService
											.orderList(
													$scope.listUri,
													$scope.listId,
													$scope.orderBy,
													$scope.orderReverseHash[$scope.orderBy],
													fromIndex, l_pageSizeNumber)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								};

								$scope.search = function(searchCriterias) {
									console.log('kwpServerPagedList::search('
											+ JSON.stringify(searchCriterias)
											+ '), listId=' + $scope.listId);
									PagedListsService
											.searchList(
													$scope.listUri,
													$scope.listId,
													$scope.listName,
													searchCriterias,
													$scope.orderBy,
													$scope.orderReverseHash[$scope.orderBy],
													0, l_pageSizeNumber)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								};

								// Main
								//
								$scope.currentPage = 0;

								var doCreateList = function() {
									console
											.log("kwpServerPagedList.doCreateList("
													+ $scope.listId
													+ ","
													+ JSON
															.stringify($scope.searchCriteriasBase)
													+ ")");
									PagedListsService
											.createList(
													$scope.listUri,
													$scope.listFactory,
													$scope.listFactoryParams,
													$scope.listId,
													$scope.listName,
													$scope.searchCriteriasBase,
													searchCriterias,
													$scope.orderBy,
													$scope.orderReverseHash[$scope.orderBy],
													0, l_pageSizeNumber)
											.success(
													function(response) {
														udpdateFromSuccessResponse(response);

														console
																.log('Broadcasting:'
																		+ $scope.listId
																		+ 'Created');
														$scope
																.$broadcast($scope.listId
																		+ 'Created');
													})
											.error(
													function(errorResponse,
															status) {
														CommonServices
																.handleHttpErrorResponse(
																		$scope,
																		errorResponse,
																		status);
													});
								};

								doCreateList();

								$scope.$on($scope.listId + 'RefreshList',
										function(event) {
											console.log("kwpServerPagedList:"
													+ $scope.listId
													+ "RefreshList");
											getPage(0);
										});
								$scope.$on($scope.listId + 'CreateList',
										function(event) {
											console.log("kwpServerPagedList:"
													+ $scope.listId
													+ "CreateList");
											doCreateList();
										});

							} ];
					directive.link = function(scope, element, attrs) {
						scope.itemClick = function(i_item) {
							// console.log('link.itemClick(' + i_item.id + ')');
							if (scope.onItemClick)
								scope.onItemClick({
									item : i_item
								});
						};
					};
					return directive;
				} ]);

fmkDirectives.directive('usersGrid', function() {
	return {
		replace : true,
		restrict : 'ECA',
		templateUrl : './fmk_include/users_grid.html'
	};
});

fmkDirectives.directive('usersTable', function() {
	return {
		replace : true,
		restrict : 'ECA',
		templateUrl : './fmk_include/users_table.html'
	};
});
fmkServices.factory('MongoDBService', [
		'$http',
		function($http) {
			return {
				getDocument : function(uri, collection, id) {
					return $http.get(HTTP_ROOT
							+ encodeURI(uri + '/' + collection + '/' + id));
				},
				getDistincts : function(uri, collection, field, querydocument) {
					return $http.put(HTTP_ROOT
							+ encodeURI(uri + '/' + collection), {
						'distinct' : field,
						'query' : querydocument
					});
				},
				getDocuments : function(uri, collection, querydocument) {
					return $http.put(HTTP_ROOT
							+ encodeURI(uri + '/' + collection), {
						'query' : querydocument
					});
				},
				addDocument : function(uri, collection, id, document) {
					return $http.post(HTTP_ROOT
							+ encodeURI(uri + '/' + collection + '/' + id),
							document);
				},
				updateDocument : function(uri, collection, id, updatedocument) {
					return $http.put(HTTP_ROOT
							+ encodeURI(uri + '/' + collection + '/' + id),
							updatedocument);
				}
			};
		} ]);

fmkServices.factory('PagedListsService', [
		'$http',
		function($http) {
			return {
				createList : function(uri, listFactory, listFactoryParams,
						listId, listName, searchCriteriasBase, searchCriterias,
						sortCriteria, reverse, fromIndex, pageSize) {
					var req = {
						"listFactory" : listFactory,
						"listFactoryParams" : listFactoryParams,
						"listName" : listName,
						"searchCriteriasBase" : searchCriteriasBase,
						"searchCriterias" : searchCriterias,
						"sortCriteria" : sortCriteria,
						"reverse" : reverse,
						"fromIndex" : fromIndex,
						"pageSize" : pageSize
					};
					return $http.post(
							HTTP_ROOT + encodeURI(uri + '/' + listId), req);
				},
				addItem : function(uri, listId, itemId, item) {
					var req = {
						"item" : item
					};
					console.log('PagedListsService.addItem called ' + item);
					return $http
							.post(HTTP_ROOT
									+ encodeURI(uri + '/' + listId + '/'
											+ itemId), req);
				},
				updateList : function(uri, listId, from, fromIndex, pageSize) {
					var req = {
						"from" : from,
						"fromIndex" : fromIndex,
						"pageSize" : pageSize
					};
					console.log('PagedListsService.updateList called');
					return $http.put(HTTP_ROOT + encodeURI(uri + '/' + listId),
							req);
				},
				removeItem : function(uri, listId, itemId) {
					return $http['delete'](HTTP_ROOT
							+ encodeURI(uri + '/' + listId + '/' + itemId));
				},
				searchList : function(uri, listId, listName, searchCriterias,
						sortCriteria, reverse, fromIndex, pageSize) {
					var req = {
						"listName" : listName,
						"searchCriterias" : searchCriterias,
						"sortCriteria" : sortCriteria,
						"reverse" : reverse,
						"fromIndex" : fromIndex,
						"pageSize" : pageSize
					};
					return $http.put(HTTP_ROOT + encodeURI(uri + '/' + listId),
							req);
				},
				orderList : function(uri, listId, sortCriteria, reverse,
						fromIndex, pageSize) {
					var req = {
						"sortCriteria" : sortCriteria,
						"reverse" : reverse,
						"fromIndex" : fromIndex,
						"pageSize" : pageSize
					};
					return $http.put(HTTP_ROOT + encodeURI(uri + '/' + listId),
							req);
				},
				getPage : function(uri, listId, fromIndex, pageSize) {
					return $http.get(HTTP_ROOT
							+ encodeURI(uri + '/' + listId + '/' + fromIndex
									+ '/' + pageSize));
				}
			};
		} ]);
fmkServices.factory('UserService', [
		'$http',
		function($http) {
			return {
				login : function(credentials) {
					return $http.post(encodeURI(HTTP_ROOT + 'auth'),
							credentials);
				},
				logout : function(sessionId) {
					return $http({
						method : 'DELETE',
						url : encodeURI(HTTP_ROOT + 'auth/' + sessionId)
					});
				},

				register : function(registrationInfo) {
					return $http.post(HTTP_ROOT + 'users?action=register',
							registrationInfo);
				},

				activate : function(key) {
					// return $http.get(HTTP_ROOT + 'users?action=activate&key='
					// + key);
					return $http
							.get(encodeURI(HTTP_ROOT + 'activation/' + key));
				},
				exists : function(req) {
					return $http.post(HTTP_ROOT + 'users?action=exists', req);
				},
				getAll : function() {
					return $http.get(HTTP_ROOT + 'users?action=getAllUsers');
				},
				getUser : function(sessionId) {
					var req = {
						"sessionId" : sessionId
					};
					return $http.post(HTTP_ROOT + 'users?action=getUser', req);
				},
				getUserByUsername : function(username) {
					var req = {
						"username" : username
					};
					return $http.post(HTTP_ROOT + 'users?action=getUser', req);
				},
				addUserRole : function(username, newRole) {
					var req = {
						"username" : username,
						"role" : newRole
					};
					return $http.post(HTTP_ROOT + 'users?action=addUserRole',
							req);
				},
				removeUserRole : function(username, newRole) {
					var req = {
						"username" : username,
						"role" : newRole
					};
					return $http.post(
							HTTP_ROOT + 'users?action=removeUserRole', req);
				},
				setUserAddress : function(username, address) {
					var req = {
						"username" : username,
						"address" : address
					};
					return $http.post(
							HTTP_ROOT + 'users?action=setUserAddress', req);
				},
				changeUserPassword : function(username, currentPassword,
						newPassword) {
					var req = {
						"username" : username,
						"currentPassword" : currentPassword,
						"newPassword" : newPassword
					};
					return $http.post(HTTP_ROOT
							+ 'users?action=changeUserPasswconsoleord', req);
				},
				newUserPassword : function(username) {
					var req = {
						"username" : username,
					};
					return $http.post(HTTP_ROOT
							+ 'users?action=newUserPassword', req);
				},
				deleteUser : function(user) {
					return $http.post(HTTP_ROOT + 'users?action=deleteUser',
							user);
				}
			};
		} ]);
