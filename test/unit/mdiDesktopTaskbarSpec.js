(function() {
    "use strict";
    describe('mdi-desktop-taskbar-controller', function() {
        var compile, scope, element, desktopCtrl, taskbarCtrl;

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
            desktopCtrl = element.controller('mdiDesktop');
            taskbarCtrl = element.controller('mdiDesktopTaskbar');
        }));

        describe('mdi-desktop-taskbar', function() {

            it('should show window when window is hidden', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(1);
                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeFalsy();

                var minimize = element.find('.minimize')[0];
                angular.element(minimize).triggerHandler('click');
                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeTruthy();

                var listItem = element.find('.list-item')[0];
                angular.element(listItem).triggerHandler('click');

                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeFalsy();
            });

            it('should hide window when window is active', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(1);
                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeFalsy();

                var listItem = element.find('.list-item')[0];
                angular.element(listItem).triggerHandler('click');

                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeTruthy();
            });

            it('should bring window to the front if shown and not active', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(2);

                var window1ZIndex = $(windows()[0]).css('z-index');
                var window2ZIndex = $(windows()[1]).css('z-index');
                expect(window1ZIndex).toBeLessThan(window2ZIndex);

                var listItem = element.find('.list-item')[0];
                angular.element(listItem).triggerHandler('click');

                var window1ZIndex = $(windows()[0]).css('z-index');
                var window2ZIndex = $(windows()[1]).css('z-index');
                expect(window1ZIndex).toBeGreaterThan(window2ZIndex);
            });

            it('should close window when close button is clicked', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(1);

                var closeButton = element.find('.desktop-taskbar-list-item-close')[0];
                angular.element(closeButton).triggerHandler('click');

                expect(windows().length).toBe(0);
            });

            it('should hide all windows when hide/show button is click the first time', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(2);

                var windowToggleBtn = element.find('.desktop-taskbar-hide-button')[0];
                angular.element(windowToggleBtn).triggerHandler('click');

                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeTruthy();
                expect(angular.element(windows()[1]).hasClass('ng-hide')).toBeTruthy();
            });

            it('should show all windows when hide/show button is click the second time', function() {
                var isoScope = element.isolateScope();
                expect(windows().length).toBe(0);
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                desktopCtrl.openWindow({views: [{active: true, directiveName: 'view1'}]});
                isoScope.$digest();
                expect(windows().length).toBe(2);

                var windowToggleBtn = element.find('.desktop-taskbar-hide-button')[0];
                angular.element(windowToggleBtn).triggerHandler('click');
                angular.element(windowToggleBtn).triggerHandler('click');

                expect(angular.element(windows()[0]).hasClass('ng-hide')).toBeFalsy();
                expect(angular.element(windows()[1]).hasClass('ng-hide')).toBeFalsy();
            });
        });
    });

})();
