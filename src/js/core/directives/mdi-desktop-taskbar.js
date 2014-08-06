(function(){
    'use strict';

    var module = angular.module('mdi.desktop.taskbar', []);

    module.controller('mdiDesktopTaskbarController', ['$scope', '$window',
        function ($scope, $window) {
            var self = this;
            self.canCloseFn = undefined;

            /**
             * @mdi.doc event
             * @module mdi.desktop
             *
             * @description
             *
             */
            angular.element($window).bind('keydown', function (event) {
                $scope.$apply(function() {
                    var keySequence = $scope.desktopCtrl.getKeySequence(event);
                    if (keySequence === 'alt+d') { //Toggle Desktop
                        $scope.desktopShown = $scope.desktopCtrl.hideShowAll();
                        event.preventDefault();
                    }
                });
            });

            $scope.desktopShown = false;

            $scope.updateWindowState = function(window) {
                if (window.outOfBounds) {
                    $scope.desktopCtrl.recover(window);
                    return;
                }
                if (window.active) {
                    $scope.desktopCtrl.minimize(window);
                } else {
                    if (window.maximized === 'fill') {
                        $scope.desktopCtrl.maximize(window);
                    } else if (window.maximized === 'left') {
                        $scope.desktopCtrl.maximizeLeft(window);
                    } else if (window.maximized === 'right') {
                        $scope.desktopCtrl.maximizeRight(window);
                    }
                    $scope.desktopCtrl.clearActive();
                    window.active = true;
                    window.minimized = false;
                    window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
                }
                if ($scope.desktopShown) $scope.desktopShown = false;
            };

            $scope.hideShowAll = function(event) {
                $scope.desktopShown = $scope.desktopCtrl.hideShowAll();
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
