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