(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$rootScope', '$element', '$document', '$window',
        function ($scope, $rootScope, $element, $document, $window) {
            var self = this;

            self.x = 0,
                self.y = 0,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.titleBar = undefined,
                self.canCloseFn = undefined,
                self.canNavigateFn = undefined,
                self.cancelEditingOnNavigation = false,
                self.viewportDimensions = undefined;

            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX <= 0 ||
                        event.pageX >= self.viewportDimensions.width ||
                        $scope.window.maximized) return false;

                    $element.css({ opacity: 0.5 });
                    self.x = event.screenX - self.startX;
                    self.y = event.screenY - self.startY;

                    //Top Containment
                    self.y = self.y >= 0 ? self.y : 0;
                    //Bottom Containment
                    self.y = self.y <= self.viewportDimensions.height - self.titleBar[0].offsetHeight ? self.y : self.viewportDimensions.height - self.titleBar[0].offsetHeight;

                    //Left Containment
                    self.x = self.x >= -(self.titleBar[0].offsetWidth + self.titleBar[0].offsetLeft) ? self.x : -(self.titleBar[0].offsetWidth + self.titleBar[0].offsetLeft);
                    //Right Containment
                    self.x = self.x <=  self.viewportDimensions.width - self.titleBar[0].offsetLeft ? self.x : self.viewportDimensions.width - self.titleBar[0].offsetLeft;

                    $scope.window.top = self.y + 'px';
                    $scope.window.left = self.x + 'px';
                });
            };

            self.mouseUp = function(event) {
                $scope.$apply(function() {
                    if (event.pageY <= $scope.desktopCtrl.options.viewportTop) {
                        $scope.desktopCtrl.maximize($scope.window);
                    }
                    if (event.pageX <= 0) {
                        $scope.desktopCtrl.maximizeLeft($scope.window);
                    }
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX >= self.viewportDimensions.width - 1) {
                        $scope.desktopCtrl.maximizeRight($scope.window);
                    }
                });
                $element.css({ opacity: 1.0 });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.updateNavigationState
             * @module mdi.desktop.window
             *
             * @description
             * Updates window navigation buttons based location of the active view in the views array.
             *
             */
            self.updateNavigationState = function() {
                if ($scope.window.views === undefined) return;
                var length = $scope.window.views.length;
                $scope.disablePrevious = !!($scope.window.views[0].active || length === 1);
                $scope.disableNext = !!($scope.window.views[length - 1].active || length === 1);
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.isWindowInViewport
             * @module mdi.desktop.window
             *
             * @description
             * Determines if the window is within the viewport boundaries.
             *
             */
            self.isWindowInViewport = function() {
                $scope.$apply(function() {
                    var windowTop = 0;
                    var windowLeft = 0;
                    if (!$scope.window.minimized) {
                        windowTop = $element[0].offsetTop;
                        windowLeft = $element[0].offsetLeft;
                    } else {
                        windowTop = parseInt($scope.window.savedPosition.top, 10);
                        windowLeft = parseInt($scope.window.savedPosition.left, 10);
                    }
                    if ((windowTop + 10) >= $scope.viewportCtrl.getViewportDimensions().height ||
                        (windowLeft + 60) >= $scope.viewportCtrl.getViewportDimensions().width) {
                        $scope.window.outOfBounds = true;
                        $scope.window.active = false;
                        $scope.desktopCtrl.activateForemostWindow();
                    } else {
                        $scope.window.outOfBounds = false;
                    }
                });
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.getWindow
             * @module mdi.desktop.window
             *
             * @description
             * Gets the window object.
             *
             * @returns {object} window object.
             */
            self.getWindow = function() {
                return $scope.window;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.setWindowTitle
             * @module mdi.desktop.window
             *
             * @description
             * Sets the window title.
             *
             * @param {string} value to display in the window title bar.
             */
            self.setWindowTitle = function(value) {
                $scope.window.title = value;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.goToPreviousView
             * @module mdi.desktop.window
             *
             * @description
             * Public method for navigating to the previous view.
             *
             */
            self.goToPreviousView = function() {
                $scope.previousView();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.viewIsEditing
             * @module mdi.desktop.window
             *
             * @description
             * Checks whether view is editing.
             *
             * @returns {boolean}.
             */
            self.viewIsEditing = function () {
                var isEditing = false;
                angular.forEach($scope.window.views, function (view) {
                    if (view.isEditing === true) {
                        isEditing = true;
                    }
                }, null);
                return isEditing;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.canNavigate
             * @module mdi.desktop.window
             *
             * @description
             * Checks whether navigation can occur..
             *
             * @returns {boolean}.
             */
            self.canNavigate = function () {
                var canNavigate = true;
                if (self.canNavigateFn !== undefined) {
                    if (self.viewIsEditing()) {
                        canNavigate = self.canNavigateFn();
                    }
                }
                return canNavigate;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.removeForwardViews
             * @module mdi.desktop.window
             *
             * @description
             * Removes all view(s) forward of the active view.
             *
             */
            self.removeForwardViews = function () {
                var activeView = $scope.desktopCtrl.getActiveView($scope.window);
                var activeViewIndex = $scope.window.views.indexOf(activeView);
                for (var i =  $scope.window.views.length; i > activeViewIndex; i--) {
                    $scope.window.views.splice(i, 1);
                }
                self.updateNavigationState();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.addView
             * @module mdi.desktop.window
             *
             * @description
             * Removes all inactive view(s) following the active view and inserts a new view.
             *
             */
            self.addView = function(viewConfigOverlay) {
                self.removeForwardViews();
                var activeView = $scope.desktopCtrl.getActiveView($scope.window);
                activeView.active = false;
                var viewConfig = $scope.desktopCtrl.getDesktop().viewConfig;
                var viewConfigInstance = Object.create(viewConfig);
                var extended = angular.extend(viewConfigInstance, viewConfigOverlay);
                $scope.window.views.push(extended);
                self.updateNavigationState();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.getGlobals
             * @module mdi.desktop.window
             *
             * @description
             * returns the global values.
             *
             */
            self.getGlobals = function() {
                return $scope.window.globals;
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.firstView
             * @module mdi.desktop.window
             *
             * @description
             *
             */
            self.firstView = function() {
                if (!self.canNavigate() || $scope.disablePrevious) return;
                if (self.cancelEditingOnNavigation) $scope.desktopCtrl.getActiveView($scope.window).isEditing = false;
                var activeView = $scope.desktopCtrl.getActiveView($scope.window);
                activeView.active = false;
                $scope.window.views[0].active = true;
                self.updateNavigationState();
            };

            /**
             * @mdi.doc function
             * @name mdiDesktopWindowController.firstView
             * @module mdi.desktop.window
             *
             * @description
             *
             */
            self.lastView = function() {
                if (!self.canNavigate() || $scope.disableNext) return;
                if (self.cancelEditingOnNavigation) $scope.desktopCtrl.getActiveView($scope.window).isEditing = false;
                var activeView = $scope.desktopCtrl.getActiveView($scope.window);
                activeView.active = false;
                $scope.window.views[$scope.window.views.length - 1].active = true;
                self.updateNavigationState();
            };

            /**
             * @mdi.doc event
             * @module mdi.desktop.window
             *
             * @description
             * Monitors the browser window for height and width changes and updates the viewport accordingly.
             *
             */
            angular.element($window).bind('resize', function () {
                self.isWindowInViewport();
            });

            /**
             * @mdi.doc event
             * @module mdi.desktop.window
             *
             * @description
             *
             */
            angular.element($window).bind('keydown', function (event) {
                $scope.$apply(function() {
                    if (!$scope.window.active) return;
                    var keySequence = $scope.desktopCtrl.getKeySequence(event);
                    if (keySequence === 'alt+left') { //Previous View
                        $scope.previousView();
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+right') { //Next View
                        $scope.nextView();
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+up') { //First View
                        self.firstView();
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+down') { //Last View
                        self.lastView();
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+l') { //Maximize left
                        if (!$scope.window.maximized) {
                            $scope.desktopCtrl.savePosition($scope.window);
                            $scope.desktopCtrl.maximizeLeft($scope.window);
                        } else if ($scope.window.maximized === 'right' || $scope.window.maximized === 'fill')
                            $scope.desktopCtrl.maximizeLeft($scope.window);
                        else
                            $scope.desktopCtrl.restoreSavedPosition($scope.window);
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+r') { //Maximize right
                        if (!$scope.window.maximized) {
                            $scope.desktopCtrl.savePosition($scope.window);
                            $scope.desktopCtrl.maximizeRight($scope.window);
                        } else if ($scope.window.maximized === 'left' || $scope.window.maximized === 'fill')
                            $scope.desktopCtrl.maximizeRight($scope.window);
                        else
                            $scope.desktopCtrl.restoreSavedPosition($scope.window);
                        event.preventDefault();
                    }
                });
            });

            /**
             * @mdi.doc watch
             * @module mdi.desktop.window
             *
             * @description
             * Monitors the window element for height and width changes. Broadcasts changes to any listening parties
             *
             */
            $scope.$watch(
                function () { return [$element[0].clientWidth, $element[0].clientHeight].join('x'); },
                function (value) {
                    $rootScope.$broadcast('windowResize', value.split('x'));
                }
            );

            /**
             * @mdi.doc watch
             * @module mdi.desktop.window
             *
             * @description
             * Monitors the window's minimized state
             *
             */
            $scope.$watch('window.minimized',
                function (value) {
                    if (value && !$scope.window.maximized) {
                        $scope.desktopCtrl.savePosition($scope.window);
                    }
                }
            );

            $scope.disablePrevious = true;
            $scope.disableNext = true;

            $scope.activate = function() {
                if ($scope.window.outOfBounds) return;
                $scope.desktopCtrl.clearActive();
                $scope.window.active = true;
                $scope.window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
            };

            $scope.minimize = function() {
                $scope.desktopCtrl.minimize($scope.window);
            };

            $scope.maximize = function() {
                if ($scope.window.maximized) {
                    $scope.desktopCtrl.restoreSavedPosition($scope.window);
                    $scope.window.maximized = undefined;
                } else {
                    $scope.desktopCtrl.savePosition($scope.window);
                    $scope.desktopCtrl.maximize($scope.window);
                }
            };

            $scope.close = function() {
                $scope.desktopCtrl.closeWindow($scope.window);
            };

            $scope.windowTitleMouseDown = function (event) {
                if ($scope.window.maximized) return;
                event.preventDefault();
                self.titleBar = angular.element(event.srcElement || event.target);
                self.x = $element[0].offsetLeft;
                self.y = $element[0].offsetTop;
                self.startX = event.screenX - self.x;
                self.startY = event.screenY - self.y;

                $scope.desktopCtrl.savePosition($scope.window);

                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            $scope.previousView = function() {
                if (!self.canNavigate() || $scope.disablePrevious) return;
                if (self.cancelEditingOnNavigation) $scope.desktopCtrl.getActiveView($scope.window).isEditing = false;
                for (var i = 0; i < $scope.window.views.length; i++) {
                    var view = $scope.window.views[i];
                    if (view.active)
                    {
                        view.active = false;
                        $scope.window.views[i - 1].active = true;
                        break;
                    }
                }
                self.updateNavigationState();
            };

            $scope.nextView = function() {
                if (!self.canNavigate() || $scope.disableNext) return;
                if (self.cancelEditingOnNavigation) $scope.desktopCtrl.getActiveView($scope.window).isEditing = false;
                for (var i = 0; i < $scope.window.views.length - 1; i++) {
                    var view = $scope.window.views[i];
                    if (view.active)
                    {
                        view.active = false;
                        $scope.window.views[i + 1].active = true;
                        break;
                    }
                }
                self.updateNavigationState();
            };

            $scope.init = function() {
                self.canCloseFn = $scope.desktopCtrl.getOptions().canCloseFn;
                self.canNavigateFn = $scope.desktopCtrl.getOptions().canNavigateFn;
                self.cancelEditingOnNavigation = $scope.desktopCtrl.getOptions().cancelEditingOnNavigation;
                self.updateNavigationState();
            };
        }]);

    module.directive('mdiDesktopWindow', [function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-window.html',
            require: ['^mdiDesktop', '^mdiDesktopViewport'],
            controller: 'mdiDesktopWindowController',
            scope: {
                index: '=',
                window: '='
            },
            link: function(scope, element, attrs, ctrls) {
                scope.desktopCtrl = ctrls[0];
                scope.viewportCtrl = ctrls[1];
                scope.desktopCtrl.cascadeWindow(scope.window);
                scope.window.scope = scope;
                scope.$on("$destroy",function() {
                    element.remove();
                });
                scope.init();
            }
        };
    }]);
})();
