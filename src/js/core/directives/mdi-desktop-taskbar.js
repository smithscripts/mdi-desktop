(function(){
    'use strict';

    var module = angular.module('mdi.desktop.taskbar', []);

    module.controller('mdiDesktopTaskbarController', ['$scope', '$timeout',
        function ($scope, $timeout) {
            var self = this;

            $scope.updateWindowState = function(window) {
                if (window.active) {
                    window.active = false;
                    window.minimize = true;
                } else {
                    $scope.desktopCtrl.clearActive();
                    window.active = true;
                    window.minimize = false;
                    window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
                }
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
            }
        };
    }]);
})();
