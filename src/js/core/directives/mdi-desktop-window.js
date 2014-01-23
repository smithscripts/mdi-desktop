(function(){
    'use strict';

    var app = angular.module('mdi.desktop.window', []);

    app.directive('mdiDesktopWindow', ['$log', '$document', function($log, $document) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-window.html',
            require: '?^mdiDesktop',
            scope: true,
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs) {

                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        if (mdiDesktopCtrl === undefined) {
                            throw new Error('[mdi-desktop-window] mdiDesktopCtrl is undefined!');
                        }

                        var startX = 0, startY = 0, x = 0, y = 0;

//                        $elm.css({
//                            position: 'absolute',
//                            cursor: 'pointer'
//                        });

                        $elm.on('mousedown', function(event) {
                            // Prevent default dragging of selected content
                            event.preventDefault();
                            startX = event.pageX - x;
                            startY = event.pageY - y;
                            $document.on('mousemove', mousemove);
                            $document.on('mouseup', mouseup);
                            $elm[0].focus();
                        });

                        function mousemove(event) {
                            y = event.pageY - startY;
                            x = event.pageX - startX;
                            $elm.css({
                                top: y + 'px',
                                left:  x + 'px'
                            });
                        }

                        function mouseup() {
                            $document.unbind('mousemove', mousemove);
                            $document.unbind('mouseup', mouseup);
                        }
                    }
                };
            }
        };
    }]);
})();
