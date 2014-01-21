(function(){
    'use strict';

    var app = angular.module('mdi.desktop.viewport', []);

    app.directive('mdiDesktopViewport', ['$log', function($log) {
        return {
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-viewport.html',
            require: '?^mdiDesktop',
            scope: true,
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs) {
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        $log.debug('mdi-viewport');
                        if (mdiDesktopCtrl === undefined) {
                            throw new Error('[mdi-desktop-viewport] mdiDesktopCtrl is undefined!');
                        }

                        $scope.windows = mdiDesktopCtrl.windows;
                    }
                };
            }
        };
    }]);
})();
