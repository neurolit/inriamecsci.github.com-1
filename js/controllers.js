function SeedListCtrl($scope, $http) {
    $http.get('grains/grains.json').success(function(data) {
        $scope.seeds = data;
    });
}

function SeedDetailCtrl($scope, $routeParams, $http) {

    $scope.seedId = $routeParams.seedId ;

    $http.get('grains/'+$routeParams.seedId+'/meta.json').success(function (data) {
        $scope.seed = data;
    });
}