function demoMenubarController($scope) {
    $scope.openWindow = function($event, directiveName) {

        $scope.windowConfig = {
            views: [
                {
                    active: true,
                    directiveName: directiveName
                }
            ]
        }

        $scope.$parent.desktopCtrl.openWindow($scope.windowConfig);
    };
}