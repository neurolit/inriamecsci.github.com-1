function SeedListCtrl($scope, $http) {
    "use strict";
    $http.get('grains/index.json').success(function (data) {
        $scope.seeds = data;
        $scope.seedsSlicesByThree = [];
        var firstElement = 0;
        while (firstElement < $scope.seeds.length) {
            $scope.seedsSlicesByThree.push($scope.seeds.slice(firstElement, firstElement + 3)) ;
            firstElement = firstElement + 3 ;
        }
    });
}

function SeedDetailCtrl($scope, $routeParams, $http) {
    "use strict";
    $scope.seedId = $routeParams.seedId;

    $http.get('grains/' + $routeParams.seedId + '/meta.json').success(function (data) {
        $scope.seed = data;
    });
}