(function(){
    'use strict';

    var app = angular.module('mdi.desktop.menubar', []);

    app.directive('mdiDesktopMenubar', ['$log', function($log) {
        return {
            replace: true,
            templateUrl: 'src/templates/mdi-desktop-menubar.html',
            require: '?^mdiDesktop',
            scope: true,
            compile: function() {
                return {
                    pre: function($scope, $elm, $attrs) {
                    },
                    post: function($scope, $elm, $attrs, mdiDesktopCtrl) {
                        if (mdiDesktopCtrl === undefined) {
                            throw new Error('[mdi-desktop-menubar] mdiDesktopCtrl is undefined!');
                        }
                    }
                };
            }
        };
    }]);
})();
