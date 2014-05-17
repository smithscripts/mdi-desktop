(function () {
    'use strict';

    var module = angular.module('mdi.desktop', [
        'ngAnimate',
        'mdi.desktop.menubar',
        'mdi.desktop.viewport',
        'mdi.desktop.taskbar',
        'mdi.desktop.window',
        'mdi.desktop.view',
        'mdi.draggable',
        'mdi.resizable'
    ]);

    module.constant('mdiDesktopConstants', {
        // copied from http://www.lsauer.com/2011/08/javascript-keymap-keycodes-in-json.html
        keymap: {
            TAB: 9,
            STRG: 17,
            CTRL: 17,
            CTRLRIGHT: 18,
            CTRLR: 18,
            SHIFT: 16,
            RETURN: 13,
            ENTER: 13,
            BACKSPACE: 8,
            BCKSP: 8,
            ALT: 18,
            ALTR: 17,
            ALTRIGHT: 17,
            SPACE: 32,
            WIN: 91,
            MAC: 91,
            FN: null,
            UP: 38,
            DOWN: 40,
            LEFT: 37,
            RIGHT: 39,
            ESC: 27,
            DEL: 46,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123
        }
    });

    module.service('desktopClassFactory',
        function () {

            var service = {
                /**
                 * @ngdoc method
                 * @name createDesktop
                 * @methodOf mdi.desktop.service:desktopClassFactory
                 * @description Creates a new desktop instance.
                 * @returns {Desktop} desktop
                 */
                createDesktop : function() {
                    var desktop = new Desktop();
                    return desktop;
                }
            }

            /**
             * @ngdoc function
             * @name mdi.desktop.class:Desktop
             * @description Desktop defines a logical desktop.  Any non-dom properties and elements needed by the desktop should
             *              be defined in this class
             */
            var Desktop = function () {
                this.options = new DesktopOptions();
            };

            /**
             * @ngdoc function
             * @name mdi.desktop.class:DesktopOptions
             * @description Default DesktopOptions class.  DesktopOptions are defined by the application developer and overlaid
             * over this object.
             */
            function DesktopOptions() {
                this.showLaunchMenu = false;
                this.showMenubar = true;
                this.menubarHeight = 32;
                this.viewportTop = this.showMenubar ? this.menubarHeight : 0;
            }

            return service;
        });

    module.controller('mdiDesktopController', ['$scope', 'mdiDesktopConstants', 'desktopClassFactory',
        function ($scope, mdiDesktopConstants, desktopClassFactory) {
            var self = this;

            self.allMinimized = false,
            self.desktop = desktopClassFactory.createDesktop();

            self.getOptions = function() {
                return $scope.options;
            }

            self.getWindows = function() {
                return $scope.windows;
            }

            self.getNextMaxZIndex = function() {
                var max = 0;
                var tmp;
                for (var i= $scope.windows.length - 1; i >= 0; i--) {
                    tmp = $scope.windows[i].zIndex;
                    if (tmp > max) max = tmp;
                }
                return max + 1;
            }

            self.clearActive = function() {
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                });
            }

            self.hideShowAll = function() {
                self.allMinimized = !self.allMinimized
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                    window.minimized = self.allMinimized;
                });
            }

            /**
             * Moves a window to the next cascade position.
             */
            self.cascadeWindow = function (window) {
                lastWindowCascadePosition.top += 10;
                lastWindowCascadePosition.left += 10;
                if (lastWindowCascadePosition.top > maxWindowCascadePosition)
                    lastWindowCascadePosition.top = minWindowCascadePosition;
                if (lastWindowCascadePosition.left > maxWindowCascadePosition)
                    lastWindowCascadePosition.left = minWindowCascadePosition;

                window.top = lastWindowCascadePosition.top + 'px';
                window.left = lastWindowCascadePosition.left + 'px';
            }
            var minWindowCascadePosition = 40;
            var maxWindowCascadePosition = 100;
            var lastWindowCascadePosition = { top: minWindowCascadePosition, left: minWindowCascadePosition };

            $scope.options = self.desktop.options;
            $scope.windows = [];

            $scope.openWindow = function(title, templateUrl) {
                self.clearActive();
                var zIndex = self.getNextMaxZIndex()
                $scope.windows.push(
                    {
                        title: title,
                        active: true,
                        minimized: false,
                        maximized: false,
                        outOfBounds: false,
                        split: null,
                        top: 0,
                        left: 0,
                        right: 'auto',
                        bottom: 'auto',
                        height: '400px',
                        width: '400px',
                        minHeight: '200px',
                        minWidth: '200px',
                        zIndex: zIndex,
                        views: [
                            {
                                templateUrl: templateUrl,
                                active: true
                            }
                        ]
                    }
                );
            }
        }]);

    module.directive('mdiDesktop',
        ['$compile',
            function($compile) {
                return {
                    restrict: 'A',
                    templateUrl: 'src/templates/mdi-desktop.html',
                    scope: {
                        mdiDesktop: '='
                    },
                    replace: true,
                    controller: 'mdiDesktopController'
                };
            }
        ]);
})();