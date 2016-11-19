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
