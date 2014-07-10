(function(){
    'use strict';

    var module = angular.module('mdi.desktop.taskbar', []);

    module.controller('mdiDesktopTaskbarController', ['$scope',
        function ($scope) {
            var self = this;
            self.canCloseFn = undefined;

            $scope.updateWindowState = function(window) {
                if (window.outOfBounds) {
                    $scope.desktopCtrl.cascadeWindow(window);
                    window.active = true;
                    window.outOfBounds = false;
                    window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
                    $scope.desktopCtrl.activateForemostWindow();
                    return;
                }
                if (window.active) {
                    window.active = false;
                    window.minimized = true;
                    $scope.desktopCtrl.activateForemostWindow();
                } else {
                    $scope.desktopCtrl.clearActive();
                    window.active = true;
                    window.minimized = false;
                    window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
                }
                if ($scope.desktopShown) $scope.desktopShown = false;
            };

            $scope.hideShowAll = function(event) {
                $scope.desktopCtrl.hideShowAll();
            };

            $scope.close = function(event, window) {
                $scope.desktopCtrl.closeWindow(window);
                event.stopPropagation();
                event.preventDefault();
            };

            $scope.init = function() {
                self.canCloseFn = $scope.desktopCtrl.getOptions().canCloseFn;
            }
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
                scope.init();
            }
        };
    }]);
})();
