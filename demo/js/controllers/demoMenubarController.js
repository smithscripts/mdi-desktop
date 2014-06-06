function demoMenubarController($scope) {
    $scope.openWindow = function($event, viewName) {

        $scope.windowConfig = {
            views: [
                {
                    active: true,
                    viewName: viewName
                }
            ]
        }

        $scope.$parent.desktopCtrl.openWindow($scope.windowConfig);
    };
}