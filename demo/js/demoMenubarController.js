function demoMenubarController($scope) {
    $scope.openWindow = function() {

        $scope.windowConfig = {
            title: 'Test'
        }

        $scope.$parent.desktopCtrl.openWindow($scope.windowConfig);
    };
}