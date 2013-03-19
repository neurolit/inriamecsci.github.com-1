function SeedListCtrl($scope, $http) {
    "use strict";
    $http.get('grains/grains.json').success(function (data) {
        $scope.seeds = data;
    });
}

function SeedDetailCtrl($scope, $routeParams, $http) {
    "use strict";
    $scope.seedId = $routeParams.seedId;

    $http.get('grains/' + $routeParams.seedId + '/meta.json').success(function (data) {
        $scope.seed = data;
    });
}