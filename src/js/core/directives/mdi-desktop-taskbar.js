(function(){
    'use strict';

    var module = angular.module('mdi.desktop.taskbar', []);

    module.controller('mdiDesktopTaskbarController', ['$scope', '$window',
        function ($scope, $window) {

            $scope.updateWindowState = function(wdw) {
                if (wdw.active)
                    $scope.desktopCtrl.minimize(wdw);
                else if (!wdw.outOfBounds)
                    $scope.desktopCtrl.restore(wdw);
                else if (wdw.outOfBounds)
                    $scope.desktopCtrl.recover(wdw);
            };

            $scope.hideShowAll = function() {
                $scope.desktopShown = $scope.desktopCtrl.hideShowAll();
            };

            $scope.close = function(e, wdw) {
                $scope.desktopCtrl.closeWindow(wdw);
                e.stopPropagation();
                e.preventDefault();
            };
        }]);

    module.directive('mdiDesktopTaskbar', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-taskbar.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopTaskbarController',
            scope: {
                windows: '='
            },
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();
            }
        };
    }]);
})();
