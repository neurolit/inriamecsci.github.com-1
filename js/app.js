angular.module('grains', []).
    config(function($routeProvider) {
        $routeProvider.
            when('/grains', {templateUrl: 'partials/grains-list.html', controller: SeedListCtrl}).
            when('/grains/:seedId', {templateUrl: 'partials/grains-detail.html', controller: SeedDetailCtrl}).
            otherwise({redirectTo: '/grains'});
});
