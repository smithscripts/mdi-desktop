(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$rootScope', '$element', '$document', '$window',
        function ($scope, $rootScope, $element, $document, $window) {
            var self = this;

            self.top,
                self.left,
                self.right,
                self.bottom,
                self.height,
                self.width;

            self.x = 0,
                self.y = 0,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.titleBar = undefined,
                self.canCloseFn = undefined;
                self.viewportDimensions = undefined;

            self.storeWindowValues = function() {
                self.top = $scope.window.top;
                self.left = $scope.window.left;
                self.right = $scope.window.right;
                self.bottom = $scope.window.bottom;
                self.height = $scope.window.height;
                self.width = $scope.window.width;
            };

            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX <= 0 ||
                        event.pageX >= self.viewportDimensions.width ||
                        $scope.window.split) return false;

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
            }

            self.mouseUp = function(event) {
                $scope.$apply(function() {
                    if (event.pageX <= 0) {
                        $scope.window.split = true;
                        $scope.window.top = 0;
                        $scope.window.left = 0;
                        $scope.window.bottom = 0;
                        $scope.window.width = '50%';
                        $scope.window.height = 'auto';
                    }
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX >= self.viewportDimensions.width - 1) {
                        $scope.window.split = true;
                        $scope.window.top = 0;
                        $scope.window.left = '50%';
                        $scope.window.right = 0;
                        $scope.window.bottom = 0;
                        $scope.window.width = '50%';
                        $scope.window.height = 'auto';
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
                if ($scope.window.views[0].active || length === 1) {
                    $scope.disablePrevious = true;
                } else {
                    $scope.disablePrevious = false;
                }
                if ($scope.window.views[length - 1].active || length === 1) {
                    $scope.disableNext = true;
                } else {
                    $scope.disableNext = false;
                }
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
                    var windowTop = $element[0].offsetTop;
                    var windowLeft = $element[0].offsetLeft;
                    if ((windowTop + 10) >= $scope.viewportCtrl.getViewportDimensions().height ||
                        (windowLeft + 200) >= $scope.viewportCtrl.getViewportDimensions().width) {
                        $scope.window.outOfBounds = true;
                        $scope.window.active = false;
                    } else {
                        $scope.window.outOfBounds = false;
                    };
                })
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
             * @name mdiDesktopWindowController.getActiveView
             * @module mdi.desktop.window
             *
             * @description
             * Gets the active view.
             *
             * @returns {object} view object.
             */
            self.getActiveView = function () {
                var activeView = null;
                angular.forEach($scope.window.views, function (view) {
                    if (view.active === true) {
                        activeView = view;
                    }
                });
                return activeView;
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
                var activeView = self.getActiveView();
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
                var activeView = self.getActiveView();
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
             * @mdi.doc event
             * @module mdi.desktop.window
             *
             * @description
             * Monitors the browser window for height and width changes and updates the viewport accordingly.
             *
             */
            angular.element($window).bind('resize', function () {
                self.isWindowInViewport()
            });

            /**
             * @mdi.doc event
             * @module mdi.desktop.window
             *
             * @description
             * Monitors the browser window for height and width changes and updates the viewport accordingly.
             *
             */
            angular.element($window).bind('keydown', function (event) {
                $scope.$apply(function() {
                    var keyCode = event.keyCode || event.which;
                    if (event.altKey && keyCode === 87 && $scope.window.active) {
                        event.preventDefault();
                        $scope.desktopCtrl.closeWindow($scope.window);
                        $scope.$destroy();
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
            )

            $scope.disablePrevious = true;
            $scope.disableNext = true;

            $scope.activate = function(event) {
                if ($scope.window.maximized || $scope.window.outOfBounds) return;
                $scope.desktopCtrl.clearActive();
                $scope.window.active = true;
                $scope.window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
            };

            $scope.minimize = function() {
                $scope.window.active = false;
                $scope.window.minimized = true;
            };

            $scope.resetWindowValues = function() {
                $scope.window.top = self.top;
                $scope.window.left = self.left;
                $scope.window.right = self.right;
                $scope.window.bottom = self.bottom;
                $scope.window.height = self.height;
                $scope.window.width = self.width;
            };

            $scope.maximize = function() {
                if ($scope.window.split) {
                    $scope.window.split = false;
                    $scope.resetWindowValues();
                } else if ($scope.window.maximized) {
                    $scope.resetWindowValues();
                    $scope.window.maximized = false;
                } else {
                    self.storeWindowValues();
                    $scope.window.top = 0;
                    $scope.window.left = 0;
                    $scope.window.right = 0;
                    $scope.window.bottom = 0;
                    $scope.window.height = '100%';
                    $scope.window.width = '100%';

                    $scope.window.maximized = true;
                }
            };

            $scope.close = function() {
                if (self.canCloseFn !== undefined) {
                    if (self.canCloseFn()) {
                        $scope.desktopCtrl.closeWindow($scope.window);
                        $scope.$destroy();
                    };
                } else {
                    $scope.desktopCtrl.closeWindow($scope.window);
                    $scope.$destroy();
                }
            };

            $scope.windowTitleMouseDown = function (event) {
                if ($scope.window.maximized || $scope.window.split || $scope.window.outOfBounds) return;
                event.preventDefault();
                self.titleBar = angular.element(event.srcElement);
                self.x = $element[0].offsetLeft;
                self.y = $element[0].offsetTop;
                self.startX = event.screenX - self.x;
                self.startY = event.screenY - self.y;

                self.storeWindowValues();

                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            $scope.previousView = function() {
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
                scope.init();
            }
        };
    }]);
})();
