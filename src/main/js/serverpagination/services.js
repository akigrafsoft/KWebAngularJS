fmkServices.factory('PagedListsService', [
		'$http',
		function($http) {
			return {
				createList : function(uri, factory, factoryParams,
						listId, listName, searchCriteriasBase, searchCriterias,
						sortCriteria, reverse, fromIndex, pageSize) {
					console.log("PagedListService::createList("+factory+")");
					var req = {
						"factory" : factory,
						"factoryParams" : factoryParams,
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