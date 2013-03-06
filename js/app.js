angular.module('grains', []).
    config(function($routeProvider, $locationProvider) {
        $routeProvider.
            when('/grains', {templateUrl: 'partials/grains-list.html', controller: SeedListCtrl}).
            when('/grains/:seedId', {templateUrl: 'partials/grains-detail.html', controller: SeedDetailCtrl}).
            otherwise({redirectTo: '/grains'});
        $locationProvider.hashPrefix('!');
});
