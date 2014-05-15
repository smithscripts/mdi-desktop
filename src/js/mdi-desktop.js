(function(){
    'use strict';

    var module = angular.module('mdi.desktop.menubar', []);

    module.controller('mdiDesktopMenubarController', ['$scope',
        function ($scope) {
            var self = this;
        }]);

    module.directive('mdiDesktopMenubar', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-menubar.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopMenubarController',
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;
                scope.options = desktopCtrl.getOptions();
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
            replace: true,
            link: function(scope, element, attrs) {
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

            $scope.showLeftOutline = false;
            $scope.showRightOutline = false;

            $scope.viewportMouseDown = function (event) {
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            angular.element($window).bind('resize', function () {
                $scope.$apply(function() {
                    $scope.dimensions.height = $element[0].clientHeight;
                    $scope.dimensions.width = $element[0].clientWidth;
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

                $timeout(function() {
                    scope.dimensions = {
                        height: element[0].clientHeight,
                        width: element[0].clientWidth
                    };
                }, 100)
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

            self.storeWindowValues = function(top, left, right, bottom, height, width) {
                self.top = top;
                self.left = left;
                self.right = right;
                self.bottom = bottom;
                self.height = height;
                self.width = width;
            };

            self.x = $element[0].offsetLeft,
                self.y = $element[0].offsetTop,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.titleBar = undefined;
            self.viewportDimensions = undefined;

            self.mouseMove = function(event) {
                $scope.$apply(function() {
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX <= 0 || event.pageX >= self.viewportDimensions.width || $scope.split) return false;

                    $element.css({ opacity: 0.5 });
                    self.x = event.screenX - self.startX
                    self.y = event.screenY - self.startY

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

                        self.storeWindowValues(
                            $scope.window.top,
                            $scope.window.left,
                            $scope.window.right,
                            $scope.window.bottom,
                            $scope.window.height,
                            $scope.window.width);

                        $scope.window.top = 0;
                        $scope.window.left = 0;
                        $scope.window.bottom = 0;
                        $scope.window.width = '50%';
                        $scope.window.height = 'auto';
                    }
                    self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();
                    if (event.pageX >= self.viewportDimensions.width - 1) {
                        $scope.split = true;

                        self.storeWindowValues(
                            $scope.window.top,
                            $scope.window.left,
                            $scope.window.right,
                            $scope.window.bottom,
                            $scope.window.height,
                            $scope.window.width);

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
            }

            self.isElementInViewport = function() {
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
            }

            $scope.views = [];
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
                if ($scope.split) return;
                if ($scope.window.maximized) {
                    $scope.resetWindowValues();
                    $scope.window.maximized = false;
                } else {
                    self.storeWindowValues(
                        $scope.window.top,
                        $scope.window.left,
                        $scope.window.right,
                        $scope.window.bottom,
                        $scope.window.height,
                        $scope.window.width);

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
                $scope.desktopCtrl.getWindows().splice($scope.index, 1);
            };

            $scope.windowTitleMouseDown = function (event) {
                if ($scope.window.maximized || $scope.window.outOfBounds) return;
                event.preventDefault()
                self.titleBar = angular.element(event.srcElement);
                self.x = $element[0].offsetLeft;
                self.y = $element[0].offsetTop;
                self.startX = event.screenX - self.x
                self.startY = event.screenY - self.y
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            };

            $scope.unlock = function() {
                $scope.split = false;
                $scope.resetWindowValues();
                $scope.desktopCtrl.cascadeWindow($scope.window);
            }

            angular.element($window).bind('resize', function () {
                self.isElementInViewport()
            });
        }]);

    module.directive('mdiDesktopWindow', ['$log', '$document', '$animate', function($log, $document, $animate) {
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
(function(){
    'use strict';

    var module = angular.module('mdi.draggable', []);

    module.controller('mdiDraggableController', ['$scope', '$element', '$document', '$window',
        function ($scope, $element, $document, $window) {
            var self = this;

            self.windowElement = $element.parent().parent().parent();

            self.x = self.windowElement[0].offsetLeft,
                self.y = self.windowElement[0].offsetTop,
                self.lastX = 0,
                self.lastY = 0,
                self.startX = 0,
                self.startY = 0,
                self.viewportDimensions = undefined;

            self.mouseMove = function(event) {
                self.windowElement.css({ opacity: 0.5 });
                self.x = event.screenX - self.startX
                self.y = event.screenY - self.startY

                self.viewportDimensions = $scope.viewportCtrl.getViewportDimensions();

                self.y = self.y >= 0 ? self.y : 0;
                self.y = self.y <= self.viewportDimensions.height - $element[0].offsetHeight ? self.y : self.viewportDimensions.height - $element[0].offsetHeight;

                self.x = self.x >= -($element[0].offsetWidth + $element[0].offsetLeft) ? self.x : -($element[0].offsetWidth + $element[0].offsetLeft);
                self.x = self.x <=  self.viewportDimensions.width - $element[0].offsetLeft ? self.x : self.viewportDimensions.width - $element[0].offsetLeft;

                self.windowElement.css({
                    top: self.y + 'px',
                    left:  self.x + 'px'
                });

                console.log('Test');
            }

            self.mouseUp = function() {
                self.windowElement.css({ opacity: 1.0 });
                $document.unbind('mousemove', self.mouseMove);
                $document.unbind('mouseup', self.mouseUp);
            }

            $element.bind('mousedown', function (event) {
                if ($scope.window.maximized) return;
                event.preventDefault()
                self.startX = event.screenX - self.x
                self.startY = event.screenY - self.y
                $document.on('mousemove', self.mouseMove);
                $document.on('mouseup', self.mouseUp);
            });

            var win = angular.element($window);
            win.bind("resize",function(e){
                $scope.$apply(function() {
                    if (self.viewportDimensions === undefined) return

                    self.y = self.y <= self.viewportDimensions.height - $element[0].offsetHeight ? self.y : self.viewportDimensions.height - $element[0].offsetHeight;
                    self.x = self.x <=  self.viewportDimensions.width - $element[0].offsetLeft ? self.x : self.viewportDimensions.width - $element[0].offsetLeft;

                    self.y = self.y >= 0 ? self.y : 0;
                    self.x = self.x >= 0 ? self.x : 0;

                    self.windowElement.css({
                        top: self.y + 'px',
                        left:  self.x + 'px'
                    });
                })
            })
        }]);

    module.directive('mdiDraggable', ['$document', function($document) {
        return {
            restrict: 'A',
            replace: false,
            require: '?^mdiDesktopViewport',
            controller: 'mdiDraggableController',
            scope: {
                window: '='
            },
            link: function(scope, element, attrs, viewportCtrl) {
                scope.viewportCtrl = viewportCtrl;
            }
        };
    }]);
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
                maximized: '=',
                direction: '@'
            },
            link: function(scope, element, attrs) {
                var window = angular.element(element.parent());

                var x,
                    y,
                    lastX,
                    lastY,
                    lastTop,
                    lastLeft,
                    currentHeight,
                    currentWidth,
                    currentTop,
                    currentLeft,
                    newTop,
                    newLeft,
                    newHeight,
                    newWidth;

                element.bind('mousedown', function(event) {
                    if (scope.maximized) return;
                    event.preventDefault()
                    lastX = event.pageX;
                    lastY = event.pageY
                    currentHeight = window[0].offsetHeight;
                    currentWidth = window[0].offsetWidth;
                    currentTop = window[0].offsetTop;
                    currentLeft = window[0].offsetLeft;
                    $document.on('mousemove', mouseMove);
                    $document.on('mouseup', mouseUp);

                });

                var mouseMove = function(event) {
                    newHeight = currentHeight + (event.pageY - lastY);
                    newWidth = currentWidth + (event.pageX - lastX);
                    newTop = currentTop + ((event.pageY - lastY) * 0.9);
                    newLeft = currentLeft + ((event.pageX - lastX) * 0.9);

                    var newSize = calculateNewSize({
                        direction: scope.direction,
                        currHeight: currentHeight,
                        currWidth: currentWidth,
                        newHeight: newHeight,
                        newWidth: newWidth,
                        offsetX: (event.pageX - lastX),
                        offsetY: (event.pageY - lastY),
                        factor: 0.9
                    });

                    newHeight = newSize.height;
                    newWidth = newSize.width;

                    switch(scope.direction)
                    {
                        case 'nw':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'ne':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                top: newTop + 'px'
                            });
                            break;
                        case 'sw':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'se':
                            window.css({
                                height: newHeight + 'px',
                                width: newWidth + 'px'
                            });
                            break;
                        case 'w':
                            window.css({
                                width: newWidth + 'px',
                                left: newLeft + 'px'
                            });
                            break;
                        case 'n':
                            window.css({
                                height: newHeight + 'px',
                                top: newTop + 'px'
                            });
                            break;
                        case 's':
                            window.css({
                                height: newHeight + 'px'
                            });
                            break;
                        case 'e':
                            window.css({
                                width: newWidth + 'px'
                            });
                            break;
                        default:

                    }

                    currentHeight = newSize.height;
                    currentWidth = newSize.width;
                    lastX = event.pageX;
                    lastY = event.pageY
                    currentTop = newTop;
                    currentLeft = newLeft;
                }

                var calculateNewSize = function(size) {
                    var newWidth;
                    var newHeight;

                    if (size.direction === 's' || size.direction === 'e' || size.direction === 'se') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth + (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight + (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'n') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'ne') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth + (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'nw') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'w') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight - (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    } else if (size.direction === 'sw') {
                        if (Math.abs(size.offsetX) > Math.abs(size.offsetY)) {
                            newWidth = size.currWidth - (size.offsetX * size.factor);
                            newHeight = newWidth * (size.currHeight / size.currWidth);
                        } else {
                            newHeight = size.currHeight + (size.offsetY * size.factor);
                            newWidth = newHeight * (size.currWidth / size.currHeight);
                        }
                    }

                    return {
                        "height": newHeight,
                        "width": newWidth
                    };
                }

                var mouseUp = function() {
                    $document.unbind('mousemove', mouseMove);
                    $document.unbind('mouseup', mouseUp);
                }
            }
        };
    }]);
})();

(function () {
    'use strict';
    /**
     *  @ngdoc object
     *  @name mdi.desktop.service:desktopClassFactory
     */
//    angular.module('mdi.desktop').service('desktopClassFactory', [,
//        function () {
//
//            var service = {
//                /**
//                 * @ngdoc method
//                 * @name createDesktop
//                 * @methodOf mdi.desktop.service:desktopClassFactory
//                 * @description Creates a new desktop instance.
//                 * @returns {Desktop} desktop
//                 */
//                createDesktop : function() {
//                    var desktop = new Desktop();
//                    return desktop;
//                }
//            }
//
//            /**
//             * @ngdoc function
//             * @name mdi.desktop.class:Desktop
//             * @description Desktop defines a logical desktop.  Any non-dom properties and elements needed by the desktop should
//             *              be defined in this class
//             */
//            var Desktop = function () {
//                this.options = new DesktopOptions();
//            };
//
//            /**
//             * @ngdoc function
//             * @name mdi.desktop.class:DesktopOptions
//             * @description Default DesktopOptions class.  DesktopOptions are defined by the application developer and overlaid
//             * over this object.
//             */
//            function DesktopOptions() {
//                this.menus = 'both'
//            }
//
//            return service;
//        }]);
})();
angular.module('mdi.desktop').run(['$templateCache', function($templateCache) {
    'use strict';

    $templateCache.put('src/templates/mdi-desktop-menubar.html',
            "<div class=\"desktop-menubar-container\" data-ng-style=\"{'height': options.menubarHeight + 'px'}\">\r" +
            "\n" +
            "    <nav class=\"navbar navbar-default\">\r" +
            "\n" +
            "        <ul class=\"nav navbar-nav\">\r" +
            "\n" +
            "            <li><a href=\"#\" class=\"menuItem\" data-ng-click=\"openWindow('Issue', 'demo/templates/demoView1.html')\">Item1</a></li>\r" +
            "\n" +
            "        </ul>\r" +
            "\n" +
            "    </nav>\r" +
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
            "     data-ng-class=\"{'active-window': window.active}\"\r" +
            "\n" +
            "     data-ng-style=\"{'z-index': window.zIndex, 'top': window.top, 'left': window.left, 'right': window.right, 'bottom': window.bottom, 'height': window.height, 'width': window.width}\"\r" +
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
            "                <button type=\"button\" class=\"btn btn-default\" title=\"previous\" tabindex=\"-1\">\r" +
            "\n" +
            "                    <span class=\"icon-arrow-left2\"></span>\r" +
            "\n" +
            "                </button>\r" +
            "\n" +
            "                <button type=\"button\" class=\"btn btn-default\" title=\"next\" tabindex=\"-1\">\r" +
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
            "            <div class=\"btn-group btn-group-xs desktop-window-navigation-button-group\" data-ng-show=\"!split\">\r" +
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
            "            <div class=\"btn-group btn-group-xs desktop-window-navigation-button-group-split\" data-ng-show=\"split\">\r" +
            "\n" +
            "                <button type=\"button\" class=\"btn btn-default\" title=\"Un-Lock\" data-ng-click=\"unlock()\" tabindex=\"-1\">\r" +
            "\n" +
            "                    <span class=\"icon-unlocked\"></span>\r" +
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
            "                <!--<div data-mdi-desktop-view data-ng-show=\"view.active\" data-template-Url=\"{{view.templateUrl}}\"></div>-->\r" +
            "\n" +
            "            </div>\r" +
            "\n" +
            "        </div>\r" +
            "\n" +
            "    </fieldset>\r" +
            "\n" +
            "    <div class=\"desktop-window-statusbar\">\r" +
            "\n" +
            "\r" +
            "\n" +
            "    </div>\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-nw\" data-maximized=\"maximized\" data-direction=\"nw\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-ne\" data-maximized=\"maximized\" data-direction=\"ne\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-sw\" data-maximized=\"maximized\" data-direction=\"sw\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <span class=\"resizable-handle resizable-se\" data-maximized=\"maximized\" data-direction=\"se\" data-mdi-resizable></span>\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-n\" data-maximized=\"maximized\" data-direction=\"n\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-s\" data-maximized=\"maximized\" data-direction=\"s\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-w\" data-maximized=\"maximized\" data-direction=\"w\" data-mdi-resizable></span>-->\r" +
            "\n" +
            "    <!--<span class=\"resizable-handle resizable-e\" data-maximized=\"maximized\" data-direction=\"e\" data-mdi-resizable></span>-->\r" +
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
            "    <div data-mdi-desktop-menubar windows=\"windows\" data-ng-if=\"options.showMenubar\"></div>\r" +
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