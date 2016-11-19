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
