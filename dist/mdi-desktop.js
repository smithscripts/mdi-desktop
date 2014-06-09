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
                    $http.get(url).then(function (response) {
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

    module.controller('mdiDesktopTaskbarController', ['$scope',
        function ($scope) {
            var self = this;

            $scope.updateWindowState = function(window) {
                if (window.outOfBounds) {
                    $scope.desktopCtrl.cascadeWindow(window);
                    window.active = true;
                    window.outOfBounds = false;
                    return;
                }
                if (window.active) {
                    window.active = false;
                    window.minimized = true;
                } else {
                    $scope.desktopCtrl.clearActive();
                    window.active = true;
                    window.minimized = false;
                    window.zIndex = $scope.desktopCtrl.getNextMaxZIndex();
                }
            };

            $scope.hideShowAll = function(event) {
                $scope.desktopCtrl.hideShowAll();
            }

            $scope.close = function(event, index) {
                $scope.desktopCtrl.getWindows().splice(index, 1);

                event.stopPropagation();
                event.preventDefault();
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
                if (!scope.view.viewName) return;
                var tpl = $compile('<div ' + scope.view.viewName + '></div>')(scope);
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
                    if (event.pageX <= 0) {
                        $scope.showLeftOutline = true;
                    } else {
                        $scope.showLeftOutline = false;
                    };
                    if (event.pageX >= $scope.dimensions.width - 1) {
                        $scope.showRightOutline = true;
                    } else {
                        $scope.showRightOutline = false;
                    };
                });
            }

            self.mouseUp = function(event) {
                $scope.$apply(function() {
                    $scope.showLeftOutline = false;
                    $scope.showRightOutline = false;
                });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            }

            $scope.dimensions = {};
            $scope.showLeftOutline = false;
            $scope.showRightOutline = false;

            $scope.viewportMouseDown = function (event) {
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
            }, function (newValue, oldValue) {
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
        }]);

    module.directive('mdiDesktopViewport', ['$timeout', '$window', function($timeout, $window) {
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
            }
        };
    }]);
})();

(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$element', '$document', '$window',
        function ($scope, $element, $document, $window) {
            var self = this;

            self.top,
                self.left,
                self.right,
                self.bottom,
                self.height,
                self.width;

            self.storeWindowValues = function() {
                self.top = $scope.window.top;
                self.left = $scope.window.left;
                self.right = $scope.window.right;
                self.bottom = $scope.window.bottom;
                self.height = $scope.window.height;
                self.width = $scope.window.width;
            };

            self.x = 0,
                self.y = 0,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.titleBar = undefined,
                self.viewportDimensions = undefined;

            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX <= 0 ||
                        event.pageX >= self.viewportDimensions.width ||
                        $scope.split) return false;

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
                        $scope.split = true;
                        $scope.window.top = 0;
                        $scope.window.left = 0;
                        $scope.window.bottom = 0;
                        $scope.window.width = '50%';
                        $scope.window.height = 'auto';
                    }
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX >= self.viewportDimensions.width - 1) {
                        $scope.split = true;
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
             * @function
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
             * @function
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
             * @function
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
             * @function
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
             * @function
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
             * @function
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
             * @function
             *
             * @description
             * Removes all inactive view(s) following the active view and inserts a new view.
             *
             */
            self.addView = function(viewConfigOverlay) {
                self.removeForwardViews();
                var activeView = self.getActiveView();
                activeView.active = false;
                var viewConfig = {
                    active: true,
                    data: undefined,
                    isDirty: false,
                    isInvalid: false,
                    viewName: undefined
                };
                var extended = angular.extend(viewConfig, viewConfigOverlay);
                var copy = angular.copy(extended);
                $scope.window.views.push(copy);
                self.updateNavigationState();
            };

            angular.element($window).bind('resize', function () {
                self.isWindowInViewport()
            });

            $scope.disablePrevious = true;
            $scope.disableNext = true;
            $scope.split = false;

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
                if ($scope.split) {
                    $scope.split = false;
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
                $scope.desktopCtrl.closeWindow($scope.window);
            };

            $scope.windowTitleMouseDown = function (event) {
                if ($scope.window.maximized || $scope.split || $scope.window.outOfBounds) return;
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

            self.updateNavigationState();
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
    ]); //test

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
                    lastMouseY = 0;

                element.bind('mousedown', function(event) {
                    if (scope.maximized) return;
                    event.preventDefault();
                    mouseOffsetY = event.clientY;
                    mouseOffsetX = event.clientX;
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
                            scope.window.left = (currentLeft + diffX) + 'px';
                            scope.window.width = (currentWidth - diffX) + 'px';
                        }
                        if (scope.direction.indexOf("n") > -1) {
                            if (currentHeight - diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentHeight - currentMinHeight));
                            if (currentTop + diffY < 0) mouseOffsetY = mouseOffsetY - (diffY - (diffY = 0 - currentTop));
                            scope.window.top = (currentTop + diffY) + 'px';
                            scope.window.height = (currentHeight - diffY) + 'px';
                        }
                        if (scope.direction.indexOf("e") > -1) {
                            if (currentWidth + diffX < currentMinWidth) mouseOffsetX = mouseOffsetX - (diffX - (diffX = currentMinWidth - currentWidth));
                            scope.window.width = (currentWidth + diffX) + 'px';
                        }
                        if (scope.direction.indexOf("s") > -1) {
                            if (currentHeight + diffY < currentMinHeight) mouseOffsetY = mouseOffsetY - (diffY - (diffY = currentMinHeight- currentHeight));
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
                }
            }
        };
    }]);
})();

angular.module('mdi.desktop').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/templates/mdi-desktop-menubar.html',
    "<div class=\"desktop-menubar-container\" data-ng-style=\"{'height': options.menubarHeight + 'px'}\">\r" +
    "\n" +
    "    <div data-ng-controller=\"demoMenubarController\">\r" +
    "\n" +
    "        <nav class=\"navbar navbar-default\">\r" +
    "\n" +
    "            <ul class=\"nav navbar-nav\">\r" +
    "\n" +
    "                <li><a href=\"#\" class=\"menuItem\" data-ng-click=\"openWindow($event, 'view1')\">Item1</a></li>\r" +
    "\n" +
    "            </ul>\r" +
    "\n" +
    "        </nav>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/templates/mdi-desktop-taskbar.html',
    "<div class=\"desktop-taskbar-container\">\r" +
    "\n" +
    "    <div class=\"desktop-taskbar-launch-menu\" data-ng-if=\"options.showLaunchMenu\">\r" +
    "\n" +
    "        <div class=\"desktop-taskbar-launch-button\">\r" +
    "\n" +
    "            <span class=\"icon-windows8\"></span>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"desktop-taskbar-list\" data-ng-class=\"{'desktop-taskbar-list-offset': options.showLaunchMenu}\">\r" +
    "\n" +
    "        <ul>\r" +
    "\n" +
    "            <li class=\"list-item am-fade-and-scale\"\r" +
    "\n" +
    "                data-ng-repeat=\"window in windows\"\r" +
    "\n" +
    "                data-ng-class=\"{'desktop-active-taskbar-list-item': window.active, 'desktop-taskbar-list-item-recover': window.outOfBounds}\"\r" +
    "\n" +
    "                data-ng-click=\"updateWindowState(window)\">\r" +
    "\n" +
    "                <div class=\"relative\">\r" +
    "\n" +
    "                    <div class=\"desktop-taskbar-list-item-title\">\r" +
    "\n" +
    "                        <span data-ng-show=\"!window.outOfBounds\">{{window.title}}</span>\r" +
    "\n" +
    "                        <span data-ng-show=\"window.outOfBounds\">Click to Recover</span>\r" +
    "\n" +
    "                    </div>\r" +
    "\n" +
    "                    <i class=\"icon-close desktop-taskbar-list-item-close\" data-ng-click=\"close($event, $index)\"></i>\r" +
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
    "        <div class=\"desktop-taskbar-hide-button\" data-ng-click=\"hideShowAll()\">\r" +
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
    "<div class=\"desktop-viewport-container\" data-ng-style=\"{'top': options.viewportTop + 'px'}\" data-ng-mousedown=\"viewportMouseDown($event)\">\r" +
    "\n" +
    "    <span class=\"desktop-viewport-dimensions\">{{dimensions.height}} x {{dimensions.width}}</span>\r" +
    "\n" +
    "    <div data-ng-repeat=\"window in windows\" class=\"am-fade-and-scale\">\r" +
    "\n" +
    "        <div data-mdi-desktop-window data-index=\"$index\" data-window=\"window\"></div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <div class=\"desktop-viewport-left-split-outline\" data-ng-show=\"showLeftOutline\"></div>\r" +
    "\n" +
    "    <div class=\"desktop-viewport-right-split-outline\" data-ng-show=\"showRightOutline\"></div>\r" +
    "\n" +
    "</div>"
  );


  $templateCache.put('src/templates/mdi-desktop-window.html',
    "<div class=\"desktop-window-container\"\r" +
    "\n" +
    "     data-ng-class=\"{'active-window': window.active, 'dirty-window': window.isDirty}\"\r" +
    "\n" +
    "     data-ng-style=\"{'z-index': window.zIndex, 'top': window.top, 'left': window.left, 'right': window.right, 'bottom': window.bottom, 'height': window.height, 'width': window.width, 'min-height': window.minHeight, 'minWidth': window.minWidth}\"\r" +
    "\n" +
    "     data-ng-mousedown=\"activate($event)\"\r" +
    "\n" +
    "     data-ng-hide=\"window.minimized\">\r" +
    "\n" +
    "    <div class=\"desktop-window-header\">\r" +
    "\n" +
    "        <div class=\"desktop-window-navigation\">\r" +
    "\n" +
    "            <div class=\"btn-group btn-group-xs desktop-window-navigation-button-group\">\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default\" title=\"previous\" tabindex=\"-1\" data-ng-disabled=\"disablePrevious\" data-ng-click=\"previousView()\">\r" +
    "\n" +
    "                    <span class=\"icon-arrow-left2\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default\" title=\"next\" tabindex=\"-1\" data-ng-disabled=\"disableNext\" data-ng-click=\"nextView()\">\r" +
    "\n" +
    "                    <span class=\"icon-arrow-right2\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"desktop-window-title\" data-ng-dblclick=\"maximize()\" data-ng-mousedown=\"windowTitleMouseDown($event)\">\r" +
    "\n" +
    "            <div class=\"desktop-window-title-container\">\r" +
    "\n" +
    "                <div>{{window.title}}</div>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "        <div class=\"desktop-window-action\">\r" +
    "\n" +
    "            <div class=\"btn-group btn-group-xs desktop-window-navigation-button-group\">\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default minimize\" title=\"Minimize\" data-ng-click=\"minimize()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span class=\"icon-minus\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default maximize\" title=\"\" data-ng-click=\"maximize()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span data-ng-class=\"{'icon-expand': !window.maximized, 'icon-contract': window.maximized}\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default\" data-ng-class=\"{'desktop-window-close-button-active': window.active}\" title=\"Close\" data-ng-click=\"close()\" tabindex=\"-1\">\r" +
    "\n" +
    "                    <span class=\"icon-close\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "            </div>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <fieldset data-ng-disabled=\"!window.active\">\r" +
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
    "    <div class=\"desktop-window-statusbar\">\r" +
    "\n" +
    "        <div class=\"desktop-window-statusbar-container\">\r" +
    "\n" +
    "            <span class=\"icon-info\" data-ng-class=\"{'is-dirty-icon': window.isDirty, 'no-display': !window.isDirty}\"></span>\r" +
    "\n" +
    "            <span class=\"icon-spam\" data-ng-class=\"{'is-invalid-icon': window.isInvalid, 'no-display': !window.isInvalid}\"></span>\r" +
    "\n" +
    "        </div>\r" +
    "\n" +
    "    </div>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-nw\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"nw\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-ne\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"ne\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-sw\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"sw\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-se\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"se\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-n\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"n\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-s\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"s\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-w\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"w\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-e\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"e\"></span>\r" +
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
    "</div>"
  );

}]);
