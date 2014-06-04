function demoViewController($scope, WindowService) {
    $scope.toggleDirtyState = function() {
        WindowService.updateDirtyState(!$scope.$parent.view.isDirty);
        $scope.$parent.view.isDirty = !$scope.$parent.view.isDirty
    }

    $scope.toggleValidState = function() {
        WindowService.updateValidState(!$scope.$parent.view.isInvalid);
        $scope.$parent.view.isInvalid = !$scope.$parent.view.isInvalid
    }
}