(function() {
    "use strict";
    describe('mdi-desktop viewport controller', function() {
        var compile, scope, element, ctrl;

        function windows() {
            return element.find('div.desktop-window-container');
        }

        beforeEach(module('mdi.desktop'));

        beforeEach(inject(function ($rootScope, $templateCache, $compile) {
            $templateCache.put('src/templates/mdi-desktop.html', __html__['src/templates/mdi-desktop.html']);
            $templateCache.put('src/templates/mdi-desktop-menubar.html', __html__['src/templates/mdi-desktop-menubar.html']);
            $templateCache.put('src/templates/mdi-desktop-taskbar.html', __html__['src/templates/mdi-desktop-taskbar.html']);
            $templateCache.put('src/templates/mdi-desktop-viewport.html', __html__['src/templates/mdi-desktop-viewport.html']);
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);

            scope = $rootScope.$new();
            compile = $compile;

            var elm = angular.element('<div mdi-desktop></div>');
            element = compile(elm)(scope);
            scope.$digest();
            ctrl = element.controller('mdiDesktopViewport');
        }));


        describe('mdi-desktop-viewport', function() {
            it('should create a window template for each array object', function() {
                element.isolateScope().windows.push({});
                scope.$digest();

                var windowElements = windows();
                expect(windowElements.length).toBe(1);
            });
        });
    });

})();