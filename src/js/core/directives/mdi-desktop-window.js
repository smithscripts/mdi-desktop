(function(){
    'use strict';

    var module = angular.module('mdi.desktop.window', []);

    module.controller('mdiDesktopWindowController', ['$scope', '$element',
        function ($scope, $element) {
            $scope.close = function() {
                $scope.desktopCtrl.getWindows().splice($scope.index, 1);
            };

            $element.on('mousedown', function(event) {
                $scope.$apply(function() {
                    //if ($scope.active) return;
                    $scope.desktopCtrl.clearActive();
                    if (!$scope.active)
                        $scope.active =  true;
                    $scope.zIndex = $scope.desktopCtrl.getMaxZIndex() + 1
                });
            });
        }]);

    module.directive('mdiDesktopWindow', ['$log', '$document', function($log, $document) {
        return {
            restrict: 'A',
            replace: false,
            templateUrl: 'src/templates/mdi-desktop-window.html',
            require: '?^mdiDesktop',
            controller: 'mdiDesktopWindowController',
            scope: {
                index: '=',
                windowTitle: '=',
                active: '=',
                zIndex: '='
            },
            link: function(scope, element, attrs, desktopCtrl) {
                scope.desktopCtrl = desktopCtrl;

//                var startX = 0, startY = 0, x = 0, y = 0;
//
//                element.css({
//                    position: 'absolute',
//                    cursor: 'pointer'
//                });
//
//                element.on('mousedown', function(event) {
//                    // Prevent default dragging of selected content
//                    event.preventDefault();
//                    startX = event.pageX - x;
//                    startY = event.pageY - y;
//                    $document.on('mousemove', mousemove);
//                    $document.on('mouseup', mouseup);
//                });
//
//                function mousemove(event) {
//                    y = event.pageY - startY;
//                    x = event.pageX - startX;
//                    element.css({
//                        top: y + 'px',
//                        left:  x + 'px'
//                    });
//                }
//
//                function mouseup() {
//                    $document.unbind('mousemove', mousemove);
//                    $document.unbind('mouseup', mouseup);
//                }
            }
        };
    }]);
})();
