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
    "     data-ng-style=\"{'z-index': window.zIndex, 'top': window.top, 'left': window.left, 'right': window.right, 'bottom': window.bottom, 'height': window.height, 'width': window.width, 'min-height': window.minHeight, 'minWidth': window.minWidth}\"\r" +
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
    "                <button type=\"button\" class=\"btn btn-default\" title=\"previous\" tabindex=\"-1\" data-ng-disabled=\"disablePrevious\" data-ng-click=\"previousView()\">\r" +
    "\n" +
    "                    <span class=\"icon-arrow-left2\"></span>\r" +
    "\n" +
    "                </button>\r" +
    "\n" +
    "                <button type=\"button\" class=\"btn btn-default\" title=\"next\" tabindex=\"-1\" data-ng-disabled=\"disableNext\" data-ng-click=\"nextView()\">\r" +
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
    "            <div class=\"btn-group btn-group-xs desktop-window-navigation-button-group\">\r" +
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
    "                <!--<div data-mdi-desktop-view=\"view\" data-ng-show=\"view.active\" data-template-Url=\"{{view.templateUrl}}\"></div>-->\r" +
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
    "    <span class=\"resizable-handle resizable-nw\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"nw\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-ne\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"ne\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-sw\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"sw\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-se\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"se\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-n\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"n\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-s\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"s\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-w\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"w\"></span>\r" +
    "\n" +
    "    <span class=\"resizable-handle resizable-e\" data-mdi-resizable data-window=\"window\" data-maximized=\"maximized\" data-direction=\"e\"></span>\r" +
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
    "    <div data-mdi-desktop-menubar windows=\"windows\" data-template-url=\"{{options.menubarTemplateUrl}}\" data-ng-if=\"options.menubarTemplateUrl != undefined\"></div>\r" +
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
