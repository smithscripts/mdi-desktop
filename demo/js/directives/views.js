var module = angular.module('viewDirectives', []);

module.controller('view1Controller', ['$scope',
    function ($scope) {
        var self = this;

        $scope.toggleDirtyState = function() {
            $scope.windowCtrl.getWindow().isDirty = !$scope.windowCtrl.getWindow().isDirty;
            $scope.$parent.view.isDirty = !$scope.$parent.view.isDirty;

        };

        $scope.toggleValidState = function() {
            $scope.windowCtrl.getWindow().isInvalid = !$scope.windowCtrl.getWindow().isInvalid;
            $scope.$parent.view.isInvalid = !$scope.$parent.view.isInvalid;
        };

        $scope.addAView = function() {
            $scope.windowCtrl.addView({active: false, directiveName: 'view2'});
        };

        $scope.init = function() {
            $scope.windowCtrl.setWindowTitle('View 1');
        };
    }]);

module.directive('view1',
    function() {
        return {
            restrict: 'A',
            templateUrl: 'demo/templates/demoView1.html',
            scope: {
                view: '='
            },
            replace: true,
            require: '^mdiDesktopWindow',
            controller: 'view1Controller',
            link: function(scope, element, attrs, windowCtrl) {
                scope.windowCtrl = windowCtrl;
                scope.init();
            }
        };
    }
);

module.controller('view2Controller', ['$scope',
    function ($scope) {
        var self = this;
    }]);

module.directive('view2',
    function() {
        return {
            restrict: 'A',
            templateUrl: 'demo/templates/demoView2.html',
            scope: {
                view: '='
            },
            replace: true,
            require: '^mdiDesktopWindow',
            controller: 'view2Controller',
            link: function(scope, element, attrs, windowCtrl) {
                scope.windowCtrl = windowCtrl;
            }
        };
    }
);