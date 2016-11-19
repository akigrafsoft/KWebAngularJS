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
