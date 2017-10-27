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
						listFactoryParams : '=',
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
													+ $scope.listFactory
													+ "'"
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
