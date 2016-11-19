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