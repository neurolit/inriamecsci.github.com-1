/*global
  angular, SeedListCtrl, SeedDetailCtrl
*/

var grainsApp = angular.module('grains', [
    'ngRoute',
    'grainsControllers'
]);

grainsApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    "use strict";
    $routeProvider
        .when('/grains', {templateUrl: 'partials/grains-list.html', controller: 'SeedListCtrl'})
        .when('/grains/:seedId', {templateUrl: 'partials/grains-detail.html', controller: 'SeedDetailCtrl'})
        .when('/grains/meta/:seedId', {templateUrl: 'partials/grains-meta.html', controller: 'SeedDetailCtrl'})
        .otherwise({redirectTo: '/grains'});
    $locationProvider.hashPrefix('!');
}]);
