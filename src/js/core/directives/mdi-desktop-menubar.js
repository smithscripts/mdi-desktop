(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            var self = this;

            $scope.openWindow = function(windowTitle) {
                $scope.desktopCtrl.clearActive();
                var zIndex = $scope.desktopCtrl.getNextMaxZIndex()
                $scope.windows.push({ windowTitle: windowTitle, active: true, zIndex: zIndex });
            }
        }]);

    module.directive('mdiDesktopMenubar', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-menubar.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopMenubarController',
            scope: {
                windows: '='
            },
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
            }
        };
    }]);
})();
