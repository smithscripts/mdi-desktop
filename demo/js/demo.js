var module = angular.module('demo', []);

module.controller('demoController', function($rootScope, $scope) {
    $rootScope.globals = { issueRef: 1 };

    $scope.canClose = function() {
        return true;
    }

    $scope.desktopOptions = {
        showLaunchMenu: false,
        globals: 'globals',
        menubarTemplateUrl: 'demo/templates/menu.html',
        canCloseFn: $scope.canClose,
        displayViewportDimensions: true
    };
});

module.controller('demoMenubarController', function($scope) {
    $scope.openWindow = function($event, overrides) {
        $scope.$parent.desktopCtrl.openWindow(overrides);
    };
});

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
            $scope.windowCtrl.addView({viewName: 'view2'});
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