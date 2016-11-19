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