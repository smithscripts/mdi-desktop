(function(){
    'use strict';

    var app = angular.module('mdi.desktop.taskbar', []);

    app.directive('mdiDesktopTaskbar', ['$log', function($log) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-taskbar.html',
            require: '?^mdiDesktop',
            scope: {
                windows: '='
            },
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs) {
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                    }
                };
            }
        };
    }]);
})();
