(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            var self = this;

            $scope.openWindow = function(event, windowOverrides) {
              $scope.desktopCtrl.openWindow(windowOverrides);
            };
        }]);

    module.directive('mdiDesktopMenubar', ['$compile', '$http', function($compile, $http) {
        return {
            restrict: 'A',
            replace: true,
            require: '?^mdiDesktop',
            scope: {},
            controller: 'mdiDesktopMenubarController',
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();

                attrs.$observe('templateUrl', function (url) {
                    $http.get(url, {cache: true}).then(function (response) {
                        var tpl = $compile(response.data)(scope);
                        element.append(tpl);
                    });
                });
            }
        };
    }]);
})();

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

(function(){
    'use strict';

    var module = angular.module('mdi.desktop.view', []);

    module.directive('mdiDesktopView', ['$compile', '$http', function($compile, $http) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                view: '='
            },
            link: function(scope, element, attrs) {
                if (!scope.view.viewDirective) return;
                var tpl = $compile('<div ' + scope.view.viewDirective + ' view="view"></div>')(scope);
                element.append(tpl);
            }
        };
    }]);
})();

(function(){
    'use strict';

    var module = angular.module('mdi.desktop.viewport', []);

    module.controller('mdiDesktopViewportController', ['$scope', '$element', '$window', '$document',
        function ($scope, $element, $window, $document) {
            var self = this;

            self.getViewportDimensions = function() {
              return $scope.dimensions;
            };
            
            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    $scope.showFillOutline = event.pageY <= $scope.options.viewportTop;
                    $scope.showLeftOutline = event.pageX <= 0;
                    $scope.showRightOutline = event.pageX >= $scope.dimensions.width - 1;
                });
            };

            self.mouseUp = function() {
                $scope.$apply(function() {
                    $scope.showFillOutline = false;
                    $scope.showLeftOutline = false;
                    $scope.showRightOutline = false;
                });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            };

            $scope.dimensions = {};
            $scope.showLeftOutline = false;
            $scope.showRightOutline = false;
            $scope.displayViewportDimensions = false;
            $scope.logoUrl = undefined;

            $scope.viewportMouseDown = function (event) {
                //Ignore resize events.
                if (event.target.nodeName.toLowerCase() === 'span') return;

                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            /**
             * @mdi.doc $watch function
             * @name mdiDesktopViewportController.visibilityWatch
             * @module mdi.desktop.viewport
             * @function
             *
             * @description
             * Monitors for visibility changes. This method is responsible for updating the viewport
             * dimensions in situations where the viewport is initially hidden.
             *
             */
            $scope.$watch(function () {
                //Emulates jQuery's $(element).is(':visible')
                return $element[0].offsetWidth > 0 && $element[0].offsetHeight > 0;
            }, function () {
                $scope.dimensions = {
                    height: $element[0].clientHeight,
                    width: $element[0].clientWidth
                };
            });

            /**
             * @mdi.doc window.resize
             * @name mdiDesktopViewportController.resize
             * @module mdi.desktop.viewport
             * @function
             *
             * @description
             * This method is responsible for updating the viewport dimensions when the
             * browser window has been re-sized.
             *
             */
            angular.element($window).bind('resize', function () {
                $scope.$apply(function () {
                    $scope.dimensions = {
                        height: $element[0].clientHeight,
                        width: $element[0].clientWidth
                    };
                });
            });

            document.querySelectorAll(".desktop-viewport-container")[0].onscroll = function (event) {
                event.preventDefault();
                document.querySelectorAll(".desktop-viewport-container")[0].scrollTop = 0;
            };

            $scope.init = function() {
                $scope.displayViewportDimensions = $scope.options.displayViewportDimensions;
                $scope.logoUrl = $scope.options.logoUrl;
            }
        }]);

    module.directive('mdiDesktopViewport', [function() {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-viewport.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopViewportController',
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
                scope: undefined,
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
            self.shiftPressed = false;
            self.altPressed = false;
            self.xPressed = false;
            self.keyboardMap = ["","","","CANCEL","","","HELP","","BACK_SPACE","TAB","","","CLEAR","ENTER","RETURN","","SHIFT","CONTROL","ALT","PAUSE","CAPS_LOCK","KANA","EISU","JUNJA","FINAL","HANJA","","ESCAPE","CONVERT","NONCONVERT","ACCEPT","MODECHANGE","SPACE","PAGE_UP","PAGE_DOWN","END","HOME","LEFT","UP","RIGHT","DOWN","SELECT","PRINT","EXECUTE","PRINTSCREEN","INSERT","DELETE","","0","1","2","3","4","5","6","7","8","9","COLON","SEMICOLON","LESS_THAN","EQUALS","GREATER_THAN","QUESTION_MARK","AT","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","WIN","","CONTEXT_MENU","","SLEEP","NUMPAD0","NUMPAD1","NUMPAD2","NUMPAD3","NUMPAD4","NUMPAD5","NUMPAD6","NUMPAD7","NUMPAD8","NUMPAD9","MULTIPLY","ADD","SEPARATOR","SUBTRACT","DECIMAL","DIVIDE","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","","","","","","","","","NUM_LOCK","SCROLL_LOCK","WIN_OEM_FJ_JISHO","WIN_OEM_FJ_MASSHOU","WIN_OEM_FJ_TOUROKU","WIN_OEM_FJ_LOYA","WIN_OEM_FJ_ROYA","","","","","","","","","","CIRCUMFLEX","EXCLAMATION","DOUBLE_QUOTE","HASH","DOLLAR","PERCENT","AMPERSAND","UNDERSCORE","OPEN_PAREN","CLOSE_PAREN","ASTERISK","PLUS","PIPE","HYPHEN_MINUS","OPEN_CURLY_BRACKET","CLOSE_CURLY_BRACKET","TILDE","","","","","VOLUME_MUTE","VOLUME_DOWN","VOLUME_UP","","","","","COMMA","","PERIOD","SLASH","BACK_QUOTE","","","","","","","","","","","","","","","","","","","","","","","","","","","OPEN_BRACKET","BACK_SLASH","CLOSE_BRACKET","QUOTE","","META","ALTGR","","WIN_ICO_HELP","WIN_ICO_00","","WIN_ICO_CLEAR","","","WIN_OEM_RESET","WIN_OEM_JUMP","WIN_OEM_PA1","WIN_OEM_PA2","WIN_OEM_PA3","WIN_OEM_WSCTRL","WIN_OEM_CUSEL","WIN_OEM_ATTN","WIN_OEM_FINISH","WIN_OEM_COPY","WIN_OEM_AUTO","WIN_OEM_ENLW","WIN_OEM_BACKTAB","ATTN","CRSEL","EXSEL","EREOF","PLAY","ZOOM","","PA1","WIN_OEM_CLEAR",""];

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
                return self.minimizeAll;
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
            self.closeWindow = function(wdw) {
                if (!self.options.allowDirtyClose && wdw.isDirty) {
                    alert("Unsaved Changes. Save changes before closing window.");
                    return false;
                }

                if (!self.options.allowInvalidClose && wdw.isInvalid) {
                    alert("Data is invalid. Correct Invalid data before closing window.");
                    return false;
                }

                if (self.options.canCloseFn !== undefined) {
                    if (self.options.canCloseFn(wdw)) {
                        $scope.windows.splice($scope.windows.indexOf(wdw), 1);
                        wdw.scope.$destroy();
                        self.activateForemostWindow();
                        return true;
                    };
                } else {
                    $scope.windows.splice($scope.windows.indexOf(wdw), 1);
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
             * @name mdiDesktopController.activatePreviousWindow
             * @module mdi.desktop
             *
             * @description
             * Set the previous window to an active state
             *
             */
            self.activatePreviousWindow = function(activeWindowLocation) {
                if ($scope.windows.length <= 1) return;
                var backend = $scope.windows.slice(activeWindowLocation);
                var frontend = $scope.windows.slice(0, activeWindowLocation - 1);
                var sorted = backend.concat(frontend);
                var nextWindow = undefined;
                for (var i = sorted.length - 1; i >= 0; i--) {
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
             * @mdi.doc function
             * @name mdiDesktopController.getKeyCode
             * @module mdi.desktop
             *
             * @description
             *
             */
            self.getKeySequence = function (event) {
                var keys = [];
                if (event.shiftKey) keys.push('shift');
                if (event.ctrlKey)  keys.push('ctrl');
                if (event.altKey)   keys.push('alt');
                if (event.metaKey)  keys.push('meta');

                var keyCode = event.keyCode || event.which;
                if (keyCode) keys.push(self.keyboardMap[keyCode].toLowerCase());

                return keys.join('+');
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
                    var keySequence = self.getKeySequence(event);
                    if (keySequence === 'alt+m') { //Maximize
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
                    if (keySequence === 'alt+n') { //Minimize
                        var activeWindow = self.getActiveWindow();
                        if (activeWindow === null || activeWindow.minimized) return;
                        self.minimize(activeWindow);
                        event.preventDefault();
                    }
                    if (keySequence === 'alt+w') { //Cycles Forward
                        var index = $scope.windows.indexOf(self.getActiveWindow());
                        self.activateNextWindow(index + 1);
                        event.preventDefault();
                    }
                    if (keySequence === 'shift+alt+w') { //Cycles Backward
                        var index = $scope.windows.indexOf(self.getActiveWindow());
                        self.activatePreviousWindow(index + 1);
                        event.preventDefault();
                    }
                    if (keySequence === 'shift+alt+x' && !(self.shiftPressed && self.altPressed && self.xPressed)) { //Close
                        var activeWindow = self.getActiveWindow();
                        if (!activeWindow) return;
                        self.closeWindow(activeWindow);
                        event.preventDefault();
                    }

                    if (event.shiftKey)
                        self.shiftPressed = true;
                    if (event.altKey)
                        self.altPressed = true;
                    if (event.keyCode === 88)
                        self.xPressed = true;
                });
            });

            angular.element($window).bind('keyup', function (event) {
                $scope.$apply(function() {
                    if (event.shiftKey)
                        self.shiftPressed = false;
                    if (event.altKey)
                        self.altPressed = false;
                    if (event.keyCode === 88)
                        self.xPressed = false;
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
(function(){
    'use strict';

    var module = angular.module('mdi.resizable', []);

    module.controller('mdiResizableController', ['$scope',
        function ($scope) {
            var self = this;
        }]);

    module.directive('mdiResizable', ['$document', function($document) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                window: '=',
                maximized: '=',
                direction: '@'
            },
            link: function(scope, element, attrs) {

                var currentHeight,
                    currentWidth,
                    currentTop,
                    currentLeft,
                    currentRight,
                    currentBottom,
                    currentMinHeight,
                    currentMinWidth,
                    mouseOffsetX = 0,
                    mouseOffsetY = 0,
                    lastMouseX = 0,
                    lastMouseY = 0,
                    originalHeight = 0,
                    originalWidth = 0,
                    viewport;

                element.bind('mousedown', function(event) {
                    if (scope.maximized) return;
                    event.preventDefault();
                    mouseOffsetY = event.clientY;
                    mouseOffsetX = event.clientX;
                    originalHeight = parseInt(scope.window.height, 10);
                    originalWidth = parseInt(scope.window.width, 10);
                    viewport = getViewport();
                    $document.on('mousemove', mouseMove);
                    $document.on('mouseup', mouseUp);
                });

                var mouseMove = function(event) {
                    scope.$apply(function() {
                        var mouseY = event.pageY - mouseOffsetY;
                        var mouseX = event.pageX - mouseOffsetX;
                        var diffY = mouseY - lastMouseY;
                        var diffX = mouseX - lastMouseX;
                        lastMouseY = mouseY;
                        lastMouseX = mouseX;

                        currentHeight = parseInt(scope.window.height, 10);
                        currentWidth = parseInt(scope.window.width, 10);
                        currentTop = parseInt(scope.window.top, 10);
                        currentLeft = parseInt(scope.window.left, 10);
                        currentRight = parseInt(scope.window.right, 10);
                        currentBottom = parseInt(scope.window.bottom, 10);
                        currentMinHeight = parseInt(scope.window.minHeight, 10);
                        currentMinWidth = parseInt(scope.window.minWidth, 10);

                        if (scope.direction.indexOf("w") > -1) {
                            if (currentWidth - diffX < currentMinWidth) mouseOffsetX = mouseOffsetX - (diffX - (diffX = currentWidth - currentMinWidth));

                            //Contain resizing to the west
                            if (currentLeft + diffX < 0)
                                mouseOffsetX = mouseOffsetX - (diffX - (diffX = 0 - currentLeft));

                            scope.window.left = (currentLeft + diffX) + 'px';
                            scope.window.width = (currentWidth - diffX) + 'px';
                        }
                        if (scope.direction.indexOf("n") > -1) {
                            if (currentHeight - diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentHeight - currentMinHeight));

                            //Contain resizing to the north
                            if (currentTop + diffY < 0) mouseOffsetY = mouseOffsetY - (diffY - (diffY = 0 - currentTop));

                            scope.window.top = (currentTop + diffY) + 'px';
                            scope.window.height = (currentHeight - diffY) + 'px';
                        }
                        if (scope.direction.indexOf("e") > -1) {
                            if (currentWidth + diffX < currentMinWidth) mouseOffsetX = mouseOffsetX - (diffX - (diffX = currentMinWidth - currentWidth));

                            //Contain resizing to the east
                            if ((currentLeft + currentWidth) + diffX > viewport[0].offsetWidth)
                                mouseOffsetX = mouseOffsetX - (diffX - (diffX = viewport[0].offsetWidth - (currentLeft + currentWidth)));

                            scope.window.width = (currentWidth + diffX) + 'px';
                        }
                        if (scope.direction.indexOf("s") > -1) {
                            if (currentHeight + diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentMinHeight- currentHeight));

                            //Contain resizing to the south
                            if ((currentTop + currentHeight) + diffY > viewport[0].offsetHeight)
                                mouseOffsetY = mouseOffsetY - (diffY - (diffY = viewport[0].offsetHeight - (currentTop + currentHeight)));

                            scope.window.height = (currentHeight + diffY) + 'px';
                        }
                    });
                }

                var mouseUp = function() {
                    mouseOffsetX = 0;
                    mouseOffsetY = 0;
                    lastMouseX = 0;
                    lastMouseY = 0;
                    $document.unbind('mousemove', mouseMove);
                    $document.unbind('mouseup', mouseUp);
                };

                var getViewport = function() {
                    return angular.element(document.querySelectorAll('.desktop-viewport-container')[0]);
                };
            }
        };
    }]);
})();

angular.module('mdi.desktop').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/templates/mdi-desktop-taskbar.html',
    "<div class=\"desktop-taskbar-container\">\r" +
    "\n" +
    "    <div class=\"desktop-taskbar-launch-menu\" data-ng-if=\"options.showLaunchMenu\">\r" +
    "\n" +
    "        <div class=\"desktop-taskbar-launch-button\">\r" +
    "\n" +
    "            <span class=\"desktop-icon-windows8\"></span>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"desktop-taskbar-list\" data-ng-class=\"{'desktop-taskbar-list-offset': options.showLaunchMenu}\">\r" +
    "\n" +
    "        <ul>\r" +
    "\n" +
    "            <li class=\"am-fade-and-scale desktop-text\"\r" +
    "\n" +
    "                data-ng-repeat=\"window in windows\"\r" +
    "\n" +
    "                data-ng-click=\"updateWindowState(window)\">\r" +
    "\n" +
    "                <div class=\"desktop-relative desktop-taskbar-list-item\" data-ng-class=\"{'desktop-active-taskbar-list-item': window.active, 'desktop-minimized-taskbar-list-item': window.minimized, 'desktop-taskbar-list-item-recover': window.outOfBounds}\">\r" +
    "\n" +
    "                    <div class=\"desktop-taskbar-list-item-title\">\r" +
    "\n" +
    "                        <span>{{window.title}}</span>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <i class=\"desktop-icon-close desktop-taskbar-list-item-close\" data-ng-class=\"{'desktop-taskbar-list-item-close-minimized': window.minimized}\" data-ng-click=\"close($event, window)\"></i>\r" +
    "\n" +
    "                </div>\r" +
    "\n" +
    "            </li>\r" +
    "\n" +
    "        </ul>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"desktop-taskbar-hide\">\r" +
    "\n" +
    "        <div class=\"desktop-taskbar-hide-button\" data-ng-click=\"hideShowAll()\" data-ng-attr-title=\"{{ desktopShown ? 'Restore All Windows - [Alt + D]' : 'Hide All Windows - [Alt + D]' }}\">\r" +
    "\n" +
    "\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/templates/mdi-desktop-viewport.html',
    "<div class=\"desktop-viewport-container\" data-ng-style=\"{'top': options.viewportTop + 'px' }\" data-ng-mousedown=\"viewportMouseDown($event)\">\r" +
    "\n" +
    "    <span class=\"desktop-viewport-dimensions desktop-text\" data-ng-show=\"displayViewportDimensions\">{{dimensions.height}} x {{dimensions.width}}</span>\r" +
    "\n" +
    "    <div data-ng-repeat=\"window in windows\" class=\"am-fade-and-scale\">\r" +
    "\n" +
    "        <div data-mdi-desktop-window data-index=\"$index\" data-window=\"window\"></div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"desktop-viewport-fill-outline\" data-ng-show=\"showFillOutline\"></div>\r" +
    "\n" +
    "    <div class=\"desktop-viewport-left-outline\" data-ng-show=\"showLeftOutline\"></div>\r" +
    "\n" +
    "    <div class=\"desktop-viewport-right-outline\" data-ng-show=\"showRightOutline\"></div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/templates/mdi-desktop-window.html',
    "<div class=\"desktop-window-container\"\r" +
    "\n" +
    "     data-ng-class=\"{'desktop-window-active': window.active, 'desktop-window-maximized': window.maximized}\"\r" +
    "\n" +
    "     data-ng-style=\"{'z-index': window.zIndex, 'top': window.top, 'left': window.left, 'right': window.right, 'bottom': window.bottom, 'height': window.height, 'width': window.width, 'min-height': window.minHeight, 'minWidth': window.minWidth}\"\r" +
    "\n" +
    "     data-ng-mousedown=\"activate($event)\"\r" +
    "\n" +
    "     data-ng-hide=\"window.minimized\">\r" +
    "\n" +
    "    <div class=\"desktop-window-header\" data-ng-class=\"{'desktop-window-maximized': window.maximized, 'desktop-window-opacity': !window.active}\">\r" +
    "\n" +
    "        <div class=\"desktop-window-navigation\">\r" +
    "\n" +
    "            <div class=\"desktop-btn-group desktop-btn-group-xs desktop-window-navigation-button-group\">\r" +
    "\n" +
    "                <button type=\"button\" class=\"desktop-btn desktop-btn-default\" title=\"Go Back One View - [Alt + Left]\" tabindex=\"-1\" data-ng-disabled=\"disablePrevious\" data-ng-click=\"previousView()\">\r" +
    "\n" +
    "                    <span class=\"desktop-icon-arrow-left2 custom-nav-button\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"desktop-btn desktop-btn-default custom-nav-button\" title=\"Go Forward One View - [Alt + Right]\" tabindex=\"-1\" data-ng-disabled=\"disableNext\" data-ng-click=\"nextView()\">\r" +
    "\n" +
    "                    <span class=\"desktop-icon-arrow-right2\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"desktop-window-title\" data-ng-dblclick=\"maximize()\" data-ng-mousedown=\"windowTitleMouseDown($event)\">\r" +
    "\n" +
    "            <div class=\"desktop-click-through\">\r" +
    "\n" +
    "                <div class=\"desktop-text\">{{window.title}}</div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"desktop-window-action\">\r" +
    "\n" +
    "            <div class=\"desktop-btn-group desktop-btn-group-xs desktop-window-navigation-button-group\">\r" +
    "\n" +
    "                <button type=\"button\" class=\"desktop-btn desktop-btn-default minimize\" title=\"Minimize - [Alt + N]\" data-ng-click=\"minimize()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span class=\"desktop-icon-minus\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"desktop-btn desktop-btn-default maximize\" data-ng-attr-title=\"{{ window.maximized ? 'Restore Window' : 'Maximize Window - [Alt + M]' }}\" data-ng-click=\"maximize()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span data-ng-class=\"{'desktop-icon-expand': !window.maximized, 'desktop-icon-contract': window.maximized}\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"desktop-btn desktop-btn-default\" data-ng-class=\"{'desktop-window-close-button': window.active}\" title=\"Close Window - [Alt + SHIFT + X]\" data-ng-click=\"close()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span class=\"desktop-icon-close\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <fieldset data-ng-disabled=\"!window.active\" class=\"desktop-window-fieldset\" data-ng-class=\"{'desktop-window-opacity': !window.active}\">\r" +
    "\n" +
    "        <div class=\"desktop-window-content\">\r" +
    "\n" +
    "            <div data-ng-repeat=\"view in window.views\">\r" +
    "\n" +
    "                <div data-mdi-desktop-view view=\"view\" data-ng-show=\"view.active\"></div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </fieldset>\r" +
    "\n" +
    "    <div class=\"desktop-window-statusbar\" data-ng-class=\"{'desktop-window-maximized': window.maximized, 'desktop-window-opacity': !window.active}\">\r" +
    "\n" +
    "        <div class=\"desktop-window-statusbar-container\">\r" +
    "\n" +
    "            <span class=\"desktop-icon-info\" data-ng-class=\"{'is-dirty-icn': window.isDirty, 'desktop-display-none': !window.isDirty}\"></span>\r" +
    "\n" +
    "            <span class=\"desktop-icon-spam\" data-ng-class=\"{'is-invalid-icn': window.isInvalid, 'desktop-display-none': !window.isInvalid}\"></span>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-nw\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"nw\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-ne\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"ne\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-sw\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"sw\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-se\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"se\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-n\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"n\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-s\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"s\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-w\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"w\"></span>\r" +
    "\n" +
    "    <span class=\"desktop-window-resizable-handle desktop-window-resizable-e\" data-mdi-resizable data-window=\"window\" data-ng-show=\"!window.maximized\" data-direction=\"e\"></span>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/templates/mdi-desktop.html',
    "<div class=\"desktop-wrapper\">\r" +
    "\n" +
    "    <style>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    </style>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div class=\"desktop-menubar-container\" data-ng-style=\"{'height': options.menubarHeight + 'px'}\">\r" +
    "\n" +
    "        <div data-mdi-desktop-menubar windows=\"windows\" data-template-url=\"{{options.menubarTemplateUrl}}\" data-ng-if=\"options.menubarTemplateUrl != undefined\"></div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div data-mdi-desktop-viewport windows=\"windows\"></div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <div data-mdi-desktop-taskbar windows=\"windows\"></div>\r" +
    "\n" +
    "\r" +
    "\n" +
    "    <img class=\"desktop-viewport-logo\" data-ng-src=\"{{logoUrl}}\" data-ng-show=\"logoUrl\" alt=\"\">\r" +
    "\n" +
    "</div>"
  );

}]);
