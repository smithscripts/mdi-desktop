(function() {
    "use strict";
    describe('mdi-desktop controller', function() {
        var element;
        var $scope;
        var ctrl;

        beforeEach(module('mdi.desktop'));
       // beforeEach(module('mdi.desktop.menubar'));

        beforeEach(inject(function ($rootScope, $templateCache, $compile) {
            $templateCache.put('src/templates/mdi-desktop.html', __html__['src/templates/mdi-desktop.html']);
            $templateCache.put('src/templates/mdi-desktop-menubar.html', __html__['src/templates/mdi-desktop-menubar.html']);
            $templateCache.put('src/templates/mdi-desktop-taskbar.html', __html__['src/templates/mdi-desktop-taskbar.html']);
            $templateCache.put('src/templates/mdi-desktop-viewport.html', __html__['src/templates/mdi-desktop-viewport.html']);
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);

            var elm = angular.element('<div mdi-desktop><div mdi-desktop-menubar></div></div>');
            $scope = $rootScope;
            element = $compile(elm)($scope);
            $scope.$digest();

            ctrl = element.controller('mdiMenubar');
        }));


        describe('mdi-desktop init', function() {
            it('should have the correct init values', function() {

            });
        });
    });

})();