(function() {
    "use strict";
    describe('mdi-desktop window controller', function() {
        var compile, scope, element, ctrl;

        function windows() {
            return element.find('div.desktop-window-container');
        }

        function getElement(type, index) {
            return element.find(type)[index];
        };

        beforeEach(module('mdi.desktop.window'));

        beforeEach(inject(function ($rootScope, $templateCache, $compile, $controller, $document, $window) {
            $templateCache.put('src/templates/mdi-desktop-window.html', __html__['src/templates/mdi-desktop-window.html']);
            scope = $rootScope.$new();
            compile = $compile;
            var elm = $templateCache.get('src/templates/mdi-desktop-window.html')
            element = compile(elm)(scope);

            scope.window = { views: [{ active: true }] };

            ctrl = $controller('mdiDesktopWindowController', {'$scope': scope, '$element': element, '$document': $document, '$window': $window});
            scope.$digest();
        }));

        describe('mdi-desktop-window', function() {
            it('previous and next buttons should be disabled when no views are loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));
                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous and next buttons should be disabled when one view is loaded', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be disabled and next should be enabled when two view are loaded and the first window is active', function() {
                element.appendTo(document.body);

                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: true },  { active: false }] };

                scope.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
            });

            it('previous button should be enabled and next should be disabled when two view are loaded and the second window is active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: false },  { active: true }] };
                scope.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('when view one is active and next button is clicked view two should become active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: true },  { active: false }] };
                scope.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');

                nextButton.triggerHandler('click');

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');
            });

            it('when view two is active and previous button is clicked view one should become active', function() {
                element.appendTo(document.body);
                var previousButton =  angular.element(getElement('button', 0));
                var nextButton =  angular.element(getElement('button', 1));

                scope.window = { views: [{ active: false },  { active: true }] };
                scope.updateNavigationState();
                scope.$digest();

                expect(previousButton[0]).not.toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).toHaveAttr('disabled', 'disabled');

                previousButton.triggerHandler('click');

                expect(previousButton[0]).toHaveAttr('disabled', 'disabled');
                expect(nextButton[0]).not.toHaveAttr('disabled', 'disabled');
            });

            it('getActiveWindow returns the active window', function() {
                element.appendTo(document.body);

                scope.window = { views: [{ active: false },  { active: true }] };
                scope.updateNavigationState();
                scope.$digest();

                var activeView = ctrl.getActiveView();

                expect(scope.window.views.indexOf(activeView)).toBe(1);
            });
        });
    });

})();
