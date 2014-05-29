function demoViewController($scope) {
    $scope.toggleDirtyState = function() {
        $scope.$parent.view.isDirty = !$scope.$parent.view.isDirty
    }

    $scope.toggleValidState = function() {
        $scope.$parent.view.isInvalid = !$scope.$parent.view.isInvalid
    }
}