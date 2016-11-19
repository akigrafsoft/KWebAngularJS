
fmkDirectives
		.directive(
				'kwpServerPagedListNew',
				[ function($interpolate, $parse) {
					var directive = {};
					directive.restrict = 'E';
					directive.templateUrl = "./include/serverpagination.html";
					directive.scope = false;
					directive.controller = [
							'$scope',
							'$element',
							'$attrs',
							'$injector',
							'$http',
							'PagedListsService',
							'CommonServices',
							'$interpolate',
							'$parse',
							function($scope, $element, $attrs, $injector,
									$http, PagedListsService, CommonServices,
									$interpolate, $parse) {
								// $attrs contain attributes not interpolated,
								// while $scope are

								// @parentId
								if ((typeof ($attrs.parentId) !== 'undefined')
										&& $attrs.parentId.indexOf('{{') > -1)
									$attrs
											.$observe(
													'parentId',
													function(value) {
														console
																.log('$observe:parentId='
																		+ value);
														$scope.parentId = value;
													});
								else
									$scope.parentId = $attrs.parentId;

								// @listTitle
								console.log('$attrs.listTitle='
										+ $attrs.listTitle);
								if ((typeof ($attrs.listTitle) !== 'undefined')
										&& $attrs.listTitle.indexOf('{{') > -1)
									$attrs
											.$observe(
													'listTitle',
													function(value) {
														console
																.log('$observe:listTitle='
																		+ value);
														$scope.listTitle = value;
													});
								else
									$scope.listTitle = $attrs.listTitle;
								console.log('$scope.listTitle='
										+ $scope.listTitle);

								// =listTitleAdmin
								$scope.$watch($attrs.listTitleAdmin, function(
										value) {
									console.log('$watch:listTitleAdmin='
											+ value);
									$scope.listTitleAdmin = value;
								});

								// @listFactory
								if ((typeof ($attrs.listFactory) !== 'undefined')
										&& $attrs.listFactory.indexOf('{{') > -1)
									$attrs.$observe('listFactory', function(
											value) {
										console.log('$observe:listFactory='
												+ value);
										$scope.listFactory = value;
									});
								else
									$scope.listFactory = $attrs.listFactory;
								console.log('$scope.listFactory='
										+ $scope.listFactory);

								// listFactoryParams : '@',
								if ((typeof ($attrs.listFactoryParams) !== 'undefined')
										&& $attrs.listFactoryParams
												.indexOf('{{') > -1)
									$attrs
											.$observe(
													'listFactoryParams',
													function(value) {
														console
																.log('$observe:listFactoryParams='
																		+ value);
														$scope.listFactoryParams = value;
													});
								else
									$scope.listFactoryParams = $attrs.listFactoryParams;

								// listName : '@',
								if ((typeof ($attrs.listName) !== 'undefined')
										&& $attrs.listName.indexOf('{{') > -1)
									$attrs
											.$observe(
													'listName',
													function(value) {
														console
																.log('$observe:listName='
																		+ value);
														$scope.listName = value;
													});
								else
									$scope.listName = $attrs.listName;
								// listId : '@',
								if ((typeof ($attrs.listId) !== 'undefined')
										&& $attrs.listId.indexOf('{{') > -1)
									$attrs.$observe('listId',
											function(value) {
												console.log('$observe:listId='
														+ value);
												$scope.listId = value;
											});
								else
									$scope.listId = $attrs.listId;
								// listUri : '@',
								if ((typeof ($attrs.listUri) !== 'undefined')
										&& $attrs.listUri.indexOf('{{') > -1)
									$attrs.$observe('listUri', function(value) {
										console
												.log('$observe:listUri='
														+ value);
										$scope.listUri = value;
									});
								else
									$scope.listUri = $attrs.listUri;
								// listData : '=',
								$scope.$watch($attrs.listData, function(value) {
									console.log('$watch:listData=' + value);
									$scope.listData = value;
								});
								// pageSize : '@',
								if ((typeof ($attrs.pageSize) !== 'undefined')
										&& $attrs.pageSize.indexOf('{{') > -1)
									$attrs
											.$observe(
													'pageSize',
													function(value) {
														console
																.log('$observe:pageSize='
																		+ value);
														$scope.pageSize = value;
													});
								else
									$scope.pageSize = $attrs.pageSize;
								// listLayout : '@',
								if ((typeof ($attrs.listLayout) !== 'undefined')
										&& $attrs.listLayout.indexOf('{{') > -1)
									$attrs.$observe('listLayout', function(
											value) {
										console.log('$observe:listLayout='
												+ value);
										$scope.listLayout = value;
									});
								else
									$scope.listLayout = $attrs.listLayout;
								// allowLayoutToggle : '=',
								$scope
										.$watch(
												$attrs.allowLayoutToggle,
												function(value) {
													console
															.log('$watch:allowLayoutToggle='
																	+ value);
													$scope.allowLayoutToggle = value;
												});
								// itemsGridTemplate : '@',
								if ((typeof ($attrs.itemsGridTemplate) !== 'undefined')
										&& $attrs.itemsGridTemplate
												.indexOf('{{') > -1)
									$attrs
											.$observe(
													'itemsGridTemplate',
													function(value) {
														console
																.log('$observe:itemsGridTemplate='
																		+ value);
														$scope.itemsGridTemplate = value;
													});
								else
									$scope.itemsGridTemplate = $attrs.itemsGridTemplate;
								// itemsTableTemplate : '@',
								if ((typeof ($attrs.itemsTableTemplate) !== 'undefined')
										&& $attrs.itemsTableTemplate
												.indexOf('{{') > -1)
									$attrs
											.$observe(
													'itemsTableTemplate',
													function(value) {
														console
																.log('$observe:itemsTableTemplate='
																		+ value);
														$scope.itemsTableTemplate = value;
													});
								else
									$scope.itemsTableTemplate = $attrs.itemsTableTemplate;
								// listSearchDirective : '@',
								if ((typeof ($attrs.listSearchDirective) !== 'undefined')
										&& $attrs.listSearchDirective
												.indexOf('{{') > -1)
									$attrs
											.$observe(
													'listSearchDirective',
													function(value) {
														console
																.log('$observe:listSearchDirective='
																		+ value);
														$scope.listSearchDirective = value;
													});
								else
									$scope.listSearchDirective = $attrs.listSearchDirective;
								// orderBy : '@',
								if ((typeof ($attrs.orderBy) !== 'undefined')
										&& $attrs.orderBy.indexOf('{{') > -1)
									$attrs.$observe('orderBy', function(value) {
										console
												.log('$observe:orderBy='
														+ value);
										$scope.orderBy = value;
									});
								else
									$scope.orderBy = $attrs.orderBy;
								// orderReverse : '=',
								$scope.$watch($attrs.orderReverse,
										function(value) {
											console.log('$watch:orderReverse='
													+ value);
											$scope.orderReverse = value;
										});
								// opened : '@',
								if ((typeof ($attrs.opened) !== 'undefined')
										&& $attrs.opened.indexOf('{{') > -1)
									$attrs.$observe('opened',
											function(value) {
												console.log('$observe:opened='
														+ value);
												$scope.opened = value;
											});
								else
									$scope.opened = $attrs.opened;
								// onItemClick : '&',
								// see (link)

								// allowRemove : '=',
								$scope.$watch($attrs.allowRemove, function(
										value) {
									console.log('$watch:allowRemove=' + value);
									$scope.allowRemove = value;
								});
								// allowDrop : '=',
								$scope.$watch($attrs.allowDrop,
										function(value) {
											console.log('$watch:allowDrop='
													+ value);
											$scope.allowDrop = value;
										});
								// onListModified : '&',
								// see below
								// listParam : '@'
								if ((typeof ($attrs.listParam) !== 'undefined')
										&& $attrs.listParam.indexOf('{{') > -1)
									$attrs
											.$observe(
													'listParam',
													function(value) {
														console
																.log('$observe:listParam='
																		+ value);
														$scope.listParam = value;
													});
								else
									$scope.listParam = $attrs.listParam;

								// $scope.$apply();

								$scope.displaySearch = false;

								$scope.searchCriterias = {};
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
										// $scope.onListModified();
										$scope
												.$apply(function() {
													console
															.log('onListModified');
													$scope
															.$eval($attrs.onListModified);
												});
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

								$scope.onAdd = function(object) {
									if (object.listId) {
										doUpdateList(object);
									} else {
										var fromIndex = $scope.currentPage
												* l_pageSizeNumber;
										PagedListsService
												.addItem($scope.listUri,
														$scope.listId, object)
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
										if (object.listId) {
											console.log('onRemove list<'
													+ object.listId + '>');
											object.remove = true;
											doUpdateList(object);
										} else {
											// TODO ? we should pass the whole
											// object because we cannot know
											// about 'id'
											// and this should be a POST method

											console.log('onRemove object<'
													+ object.id + '>');

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

								$scope.search = function() {
									// console.log('search(), ' +
									// JSON.stringify($scope.searchCriterias));
									PagedListsService
											.searchList(
													$scope.listUri,
													$scope.listId,
													$scope.listName,
													$scope.searchCriterias,
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
									PagedListsService
											.createList(
													$scope.listUri,
													$scope.listFactory,
													$scope.listFactoryParams,
													$scope.listId,
													$scope.listName,
													$scope.searchCriterias,
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

								// $scope.$apply(function() {
								doCreateList();
								// });

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
							console.log('link.itemClick(' + i_item.id + ')');

							if (attrs.onItemClick) {
								var invoker = $parse(attrs.onItemClick);
								invoker($scope, {
									item : i_item
								});
							}

							// if (scope.onItemClick)
							// scope.onItemClick({
							// item : i_item
							// });
						};
					};
					return directive;
				} ]);