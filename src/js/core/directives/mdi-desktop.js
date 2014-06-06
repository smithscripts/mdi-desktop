(function () {
    'use strict';

    var module = angular.module('mdi.desktop', [
        'ngAnimate',
        'mdi.desktop.menubar',
        'mdi.desktop.viewport',
        'mdi.desktop.taskbar',
        'mdi.desktop.window',
        'mdi.desktop.view',
        'mdi.resizable'
    ]);

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
                this.allowDirtyClose = false;
                this.allowInvalidClose = false;
                this.enableWindowCascading = true;
                this.menubarHeight = 32;
                this.menubarTemplateUrl = undefined;
                this.showLaunchMenu = false;
            }

            return service;
        });

    module.controller('mdiDesktopController', ['$scope', '$window', 'desktopClassFactory',
        function ($scope, $window, desktopClassFactory) {
            var self = this;

            self.allMinimized = false;
            self.desktop = desktopClassFactory.createDesktop();
            self.options = undefined;

            self.getOptions = function() {
                return $scope.options;
            };

            self.getWindows = function() {
                return $scope.windows;
            };

            self.getNextMaxZIndex = function() {
                var max = 0;
                var tmp;
                for (var i= $scope.windows.length - 1; i >= 0; i--) {
                    tmp = $scope.windows[i].zIndex;
                    if (tmp > max) max = tmp;
                }
                return max + 1;
            };

            self.clearActive = function() {
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                });
            };

            self.hideShowAll = function() {
                self.allMinimized = !self.allMinimized;
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                    window.minimized = self.allMinimized;
                });
            };

            $scope.windowConfig = {
                title: '',
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
                zIndex: -1,
                isDirty: false,
                isInvalid: false,
                views: [
                    {
                        active: true,
                        data: undefined,
                        isDirty: false,
                        isInvalid: false,
                        viewName: undefined
                    }
                ]
            };

            self.openWindow = function(overrides) {
                self.clearActive();
                $scope.windowConfig.zIndex = self.getNextMaxZIndex();
                var combined = angular.extend($scope.windowConfig, overrides);
                $scope.windows.push(angular.copy(combined));
            };

            self.closeWindow = function(window) {
                if (!self.options.allowDirtyClose && window.isDirty) {
                    alert("Unsaved Changes. Save changes before closing window.");
                    return;
                }

                if (!self.options.allowInvalidClose && window.isInvalid) {
                    alert("Data is invalid. Correct Invalid data before closing window.");
                    return;
                }
                $scope.windows.splice($scope.windows.indexOf(window), 1);
            };

            /**
             * Moves a window to the next cascade position.
             */
            self.cascadeWindow = function (window) {
                if (!$scope.options.enableWindowCascading) return;
                lastWindowCascadePosition.top += 10;
                lastWindowCascadePosition.left += 10;
                if (lastWindowCascadePosition.top > maxWindowCascadePosition)
                    lastWindowCascadePosition.top = minWindowCascadePosition;
                if (lastWindowCascadePosition.left > maxWindowCascadePosition)
                    lastWindowCascadePosition.left = minWindowCascadePosition;

                window.top = lastWindowCascadePosition.top + 'px';
                window.left = lastWindowCascadePosition.left + 'px';
            };
            var minWindowCascadePosition = 40;
            var maxWindowCascadePosition = 100;
            var lastWindowCascadePosition = { top: minWindowCascadePosition, left: minWindowCascadePosition };

            self.options = angular.extend(self.desktop.options, $scope.mdiDesktop);
            $scope.options = self.options;
            $scope.options.viewportTop = $scope.options.menubarTemplateUrl !== undefined ? $scope.options.menubarHeight : 0;

            $scope.windows = [];

            document.onselectstart = handleSelectAttempt;
            function handleSelectAttempt(e) {
                if (window.event) { e.preventDefault(); }
                return true;
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