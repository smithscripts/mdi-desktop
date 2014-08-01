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
                 * @mdi.doc function
                 * @name desktopClassFactory.createDesktop
                 * @module mdi.desktop
                 *
                 * @description
                 * Creates a new desktop instance.
                 *
                 * @returns {object} Desktop
                 */
                createDesktop : function() {
                    var desktop = new Desktop();
                    return desktop;
                }
            };

            /**
             * @mdi.doc function
             * @name desktopClassFactory.Desktop
             * @module mdi.desktop
             *
             * @description Desktop defines a logical desktop.  Any non-dom properties and elements needed by the desktop should
             * be defined in this class
             *
             */
            var Desktop = function () {
                this.options = new DesktopOptions();
                this.windowConfig = windowConfig;
                this.viewConfig = viewConfig;
            };

            /**
             * @mdi.doc object
             * @name mdiDesktopController.windowConfig
             * @module mdi.desktop
             *
             * @description
             * Default configuration object for a window. windowConfig properties can be defined by the application developer and overlaid
             * over this object.
             *
             */
            var windowConfig = {
                active: true,
                bottom: 'auto',
                globals: undefined,
                height: '400px',
                isDirty: false,
                isInvalid: false,
                left: 0,
                maximized: undefined,
                minHeight: '200px',
                minimized: false,
                minWidth: '200px',
                outOfBounds: false,
                savedPosition: {},
                right: 'auto',
                title: '',
                top: 0,
                width: '400px',
                views: [],
                zIndex: -1
            };

            /**
             * @mdi.doc object
             * @name mdiDesktopController.windowConfig
             * @module mdi.desktop
             *
             * @description
             * Default configuration object for a view. viewConfig properties can be defined by the application developer and overlaid
             * over this object.
             *
             */
            var viewConfig = {
                active: true,
                entities: undefined,
                entityIndex: 0,
                isDirty: false,
                isEditing: false,
                isInvalid: false,
                viewDirective: undefined
            };

            /**
             * @mdi.doc function
             * @name desktopClassFactory.DesktopOptions
             * @module mdi.desktop
             *
             * @description Default DesktopOptions class.  DesktopOptions are defined by the application developer and overlaid
             * over this object.
             *
             */
            function DesktopOptions() {
                this.allowDirtyClose = false;
                this.allowInvalidClose = false;
                this.cancelEditingOnNavigation = false;
                this.canCloseFn = undefined;
                this.canNavigateFn = undefined;
                this.displayViewportDimensions = false;
                this.enableAnimation = true;
                this.enableWindowCascading = true;
                this.logoUrl = undefined;
                this.menubarHeight = 32;
                this.menubarTemplateUrl = undefined;
                this.showLaunchMenu = false;
            }

            return service;
        });

    module.controller('mdiDesktopController', ['$rootScope', '$scope', '$window', '$animate', 'desktopClassFactory',
        function ($rootScope, $scope, $window, $animate, desktopClassFactory) {
            var self = this;

            self.minimizeAll = false;
            self.desktop = desktopClassFactory.createDesktop();
            self.options = undefined;
            self.minWindowCascadePosition = 40;
            self.maxWindowCascadePosition = 100;
            self.lastWindowCascadePosition = { top: self.minWindowCascadePosition, left: self.minWindowCascadePosition };
            self.options = angular.extend(self.desktop.options, $scope.mdiDesktop);

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getDesktop
             * @module mdi.desktop
             *
             * @description
             * Return an object of desktop.
             *
             * @returns {object} desktop.
             */
            self.getDesktop = function() {
                return self.desktop;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getOptions
             * @module mdi.desktop
             *
             * @description
             * Return an object of desktop options.
             *
             * @returns {object} options.
             */
            self.getOptions = function() {
                return $scope.options;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getWindows
             * @module mdi.desktop
             *
             * @description
             * Return an array of windows.
             *
             * @returns {array} windows.
             */
            self.getWindows = function() {
                return $scope.windows;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getNextMaxZIndex
             * @module mdi.desktop
             *
             * @description
             * Iterates through all window objects in the windows array to find the max z-index
             * and increases the value found by 1.
             *
             * @returns {int}
             */
            self.getNextMaxZIndex = function() {
                var max = 0;
                var tmp;
                for (var i= $scope.windows.length - 1; i >= 0; i--) {
                    tmp = $scope.windows[i].zIndex;
                    if (tmp > max) max = tmp;
                }
                return ++max;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.clearActive
             * @module mdi.desktop
             *
             * @description
             * Iterates through all window objects in the windows
             * and sets the active property to false.
             *
             */
            self.clearActive = function() {
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                });
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getActiveWindow
             * @module mdi.desktop
             *
             * @description
             * Gets the active window.
             *
             * @returns {object} view object.
             */
            self.getActiveWindow = function () {
                var activeWindow = null;
                angular.forEach($scope.windows, function (wdw) {
                    if (wdw.active === true) {
                        activeWindow = wdw;
                    }
                });
                return activeWindow;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.getActiveView
             * @module mdi.desktop
             *
             * @description
             * Gets the active view.
             *
             * @returns {object} view object.
             */
            self.getActiveView = function (wdw) {
                var activeView = null;
                angular.forEach(wdw.views, function (view) {
                    if (view.active === true) {
                        activeView = view;
                    }
                });
                return activeView;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.allWindowsAreMinimized
             * @module mdi.desktop
             *
             * @description
             * Iterates through windows to determine if all are minimized.
             *
             */
            self.allWindowsAreMinimized = function() {
                var allMinimized = true;
                angular.forEach($scope.windows, function(window){
                    if (!window.minimized) {
                        allMinimized = false;
                    }
                });
                return allMinimized;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.hideShowAll
             * @module mdi.desktop
             *
             * @description
             * Hides/shows all windows
             *
             */
            self.hideShowAll = function() {
                self.minimizeAll = self.allWindowsAreMinimized() ? false : !self.minimizeAll;
                angular.forEach($scope.windows, function(window){
                    window.active = false;
                    window.minimized = self.minimizeAll;
                });
                self.activateForemostWindow();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.openWindow
             * @module mdi.desktop
             *
             * @description
             * Displays a new window. All window properties defined by the application developer will be
             * overlaid here before displaying the window
             *
             */
            self.openWindow = function(windowConfigOverlays) {
                self.clearActive();
                var configuredWindow = self.configureWindow(windowConfigOverlays);
                configuredWindow.views = self.configureViews(windowConfigOverlays);
                $scope.windows.push(configuredWindow);
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.configureWindow
             * @module mdi.desktop
             *
             * @description
             * Creates a new window instance.
             *
             */
            self.configureWindow = function(windowConfigOverlays) {
                var windowConfigInstance = Object.create(self.desktop.windowConfig);
                windowConfigInstance.savedPosition = Object.create({ top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0 });
                windowConfigInstance.zIndex = self.getNextMaxZIndex();
                windowConfigInstance.globals = angular.extend({}, $rootScope.$eval($scope.options.globals));
                return angular.extend(windowConfigInstance, windowConfigOverlays);
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.configureViews
             * @module mdi.desktop
             *
             * @description
             * Creates one or more view instances
             *
             */
            self.configureViews = function(windowConfigOverlays) {
                var configuredViews = [];
                angular.forEach(windowConfigOverlays.views, function(view){
                    var viewConfigInstance = Object.create(self.desktop.viewConfig);
                    var configuredView = angular.extend(viewConfigInstance, view);
                    configuredViews.push(configuredView);
                });
                return configuredViews;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.closeWindow
             * @module mdi.desktop
             *
             * @description
             * Remove a window {object} from the windows array.
             *
             * @returns {boolean} returns true if window was closed, false if not closed.
             */
            self.closeWindow = function(window) {
                if (!self.options.allowDirtyClose && window.isDirty) {
                    alert("Unsaved Changes. Save changes before closing window.");
                    return false;
                }

                if (!self.options.allowInvalidClose && window.isInvalid) {
                    alert("Data is invalid. Correct Invalid data before closing window.");
                    return false;
                }

                if (self.options.canCloseFn !== undefined) {
                    if (self.options.canCloseFn(window)) {
                        $scope.windows.splice($scope.windows.indexOf(window), 1);
                        self.activateForemostWindow();
                        return true;
                    };
                } else {
                    $scope.windows.splice($scope.windows.indexOf(window), 1);
                    self.activateForemostWindow();
                    return true;
                }
                return false;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.activateForemostWindow
             * @module mdi.desktop
             *
             * @description
             * Set the foremost window to an active state
             *
             */
            self.activateForemostWindow = function() {
                var foremost = undefined;
                for (var i = 0; i < $scope.windows.length; i++) {
                    if ((foremost === undefined || $scope.windows[i].zIndex > foremost.zIndex) && !$scope.windows[i].minimized && !$scope.windows[i].outOfBounds)
                        foremost = $scope.windows[i];
                }
                if (foremost)
                    foremost.active = true;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.activateNextWindow
             * @module mdi.desktop
             *
             * @description
             * Set the next window to an active state
             *
             */
            self.activateNextWindow = function(activeWindowLocation) {
                if ($scope.windows.length <= 1) return;
                var backend = $scope.windows.slice(activeWindowLocation);
                var frontend = $scope.windows.slice(0, activeWindowLocation - 1);
                var sorted = backend.concat(frontend);
                var nextWindow = undefined;
                for (var i = 0; i < sorted.length; i++) {
                    if (!sorted[i].minimized && !sorted[i].outOfBounds && !nextWindow)
                        nextWindow = sorted[i];
                }

                if (nextWindow) {
                    self.clearActive();
                    nextWindow.zIndex = self.getNextMaxZIndex();
                    nextWindow.active = true;
                }
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.minimize
             * @module mdi.desktop
             *
             * @description
             * Visually removes window from the viewport.
             *
             */
            self.minimize = function (window) {
                window.active = false;
                window.minimized = true;
                self.activateForemostWindow();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.maximize
             * @module mdi.desktop
             *
             * @description
             * Positions window such that it fills the whole viewport.
             *
             */
            self.maximize = function (window) {
                window.top = 0;
                window.left = 0;
                window.right = 0;
                window.bottom = 0;
                window.height = 'auto';
                window.width = '100%';
                window.maximized = 'fill';
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.maximizeLeft
             * @module mdi.desktop
             *
             * @description
             * Positions window such that it fills the left portion viewport.
             *
             */
            self.maximizeLeft = function (window) {
                window.split = true;
                window.top = 0;
                window.left = 0;
                window.bottom = 0;
                window.width = '50%';
                window.height = 'auto';
                window.maximized = 'left';
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.maximizeRight
             * @module mdi.desktop
             *
             * @description
             * Positions window such that it fills the right portion viewport.
             *
             */
            self.maximizeRight = function (window) {
                window.top = 0;
                window.left = '50%';
                window.right = 0;
                window.bottom = 0;
                window.width = '50%';
                window.height = 'auto';
                window.maximized = 'right';
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.recover
             * @module mdi.desktop
             *
             * @description
             * Brings window back into view when it has escaped the viewport.
             *
             */
            self.recover = function (window) {
                window.active = true;
                window.outOfBounds = false;
                window.minimized = false;
                window.zIndex = self.getNextMaxZIndex();
                self.cascadeWindow(window);
                self.clearActive();
                self.activateForemostWindow();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.restoreSavedPosition
             * @module mdi.desktop
             *
             * @description
             * Set the windows last know position to the current position.
             *
             */
            self.restoreSavedPosition = function (wdw) {
                self.clearActive();
                wdw.top = wdw.savedPosition.top;
                wdw.left = wdw.savedPosition.left;
                wdw.right = wdw.savedPosition.right;
                wdw.bottom = wdw.savedPosition.bottom;
                wdw.height = wdw.savedPosition.height;
                wdw.width = wdw.savedPosition.width;
                wdw.maximized = undefined;
                wdw.minimized = undefined;
                wdw.active = true;
                wdw.minimized = false;
                wdw.zIndex = self.getNextMaxZIndex();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.savePosition
             * @module mdi.desktop
             *
             * @description
             * Save the windows last know position.
             *
             */
            self.savePosition = function (wdw) {
                wdw.savedPosition.top = wdw.top;
                wdw.savedPosition.left = wdw.left;
                wdw.savedPosition.right = wdw.right;
                wdw.savedPosition.bottom = wdw.bottom;
                wdw.savedPosition.height = wdw.height;
                wdw.savedPosition.width = wdw.width;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopController.closeWindow
             * @module mdi.desktop
             *
             * @description
             * Moves a window to the next cascade position.
             *
             */
            self.cascadeWindow = function (window) {
                if (!$scope.options.enableWindowCascading) return;
                self.lastWindowCascadePosition.top += 10;
                self.lastWindowCascadePosition.left += 10;
                if (self.lastWindowCascadePosition.top > self.maxWindowCascadePosition)
                    self.lastWindowCascadePosition.top = self.minWindowCascadePosition;
                if (self.lastWindowCascadePosition.left > self.maxWindowCascadePosition)
                    self.lastWindowCascadePosition.left = self.minWindowCascadePosition;

                window.top = self.lastWindowCascadePosition.top + 'px';
                window.left = self.lastWindowCascadePosition.left + 'px';
            };

            /**
             * @mdi.doc event
             * @module mdi.desktop
             *
             * @description
             *
             */
            angular.element($window).bind('keydown', function (event) {
                $scope.$apply(function() {
                    var keyCode = event.keyCode || event.which;
                    if (event.altKey && keyCode === 68) { //[Alt + d] Toggle Desktop
                        self.hideShowAll();
                        event.preventDefault();
                    }
                    if (event.altKey && keyCode === 77) { //[Alt + m] Maximize
                        var activeWindow = self.getActiveWindow();
                        if (activeWindow === null) return;
                        if (!activeWindow.maximized) {
                            self.savePosition(activeWindow);
                            self.maximize(activeWindow);
                        } else if (activeWindow.maximized === 'right' || activeWindow.maximized === 'left')
                            self.maximize(activeWindow);
                        else
                            self.restoreSavedPosition(activeWindow);
                        event.preventDefault();
                    }
                    if (event.altKey && keyCode === 78) { //[Alt + n] Minimize
                        var activeWindow = self.getActiveWindow();
                        if (activeWindow === null || activeWindow.minimized) return;
                        self.minimize(activeWindow);
                        event.preventDefault();
                    }
                    if (event.altKey && keyCode === 87) { //[Alt + w]Cycle
                        var index = $scope.windows.indexOf(self.getActiveWindow());
                        self.activateNextWindow(index + 1);
                        event.preventDefault();
                    }
                });
            });

            /**
             * @mdi.doc function
             * @name mdiDesktopController.handleSelectAttempt
             * @module mdi.desktop
             *
             * @description
             * Prevents the user from highlight desktop elements.
             *
             */
            document.onselectstart = handleSelectAttempt;
            function handleSelectAttempt(e) {
                if (window.event) { e.preventDefault(); }
                return true;
            }

            $scope.options = self.options;
            $scope.options.viewportTop = $scope.options.menubarTemplateUrl !== undefined ? $scope.options.menubarHeight + 1 : 0;
            $scope.windows = [];

            $scope.logoUrl = $scope.options.logoUrl;
            $animate.enabled($scope.options.enableAnimation);
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