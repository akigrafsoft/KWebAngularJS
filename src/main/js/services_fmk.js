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
