/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",  
    "ngSanitize",
]); 

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/*Content-Type application/json*/
MetronicApp.config(['$httpProvider', function($httpProvider){
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
    $httpProvider.interceptors.push("$httpInterceptor");

    // if(typeof(localStorage.getItem("t")) != 'undefined'){
    //     $httpProvider.defaults.headers.post['Authorization'] = localStorage.getItem("t");
    // }
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '../assets',
        globalPath: '../assets/global',
        layoutPath: '../assets/layouts/layout2',
        apiPath: 	'http://baicaimc.club:8080',
        logicApiPath: 'http://baicaimc.club:8085',
        debug: {
        	request:false,
        	requestError:false,
        	response:false,
        	responseError:false
        }
    };

    $rootScope.settings = settings;

    return settings;
}]);


/*HttpInterceptor Factory*/
MetronicApp.factory("$httpInterceptor",["$q", "$rootScope", function($q, $rootScope) {
	return {
		request: function(json) {
			if($rootScope.settings.debug.request){
				console.log("[request]:"+json.url);
			}
			
			return json || $q.when(json);
		},
	　　 requestError: function(json) {
			if($rootScope.settings.debug.requestError){
				console.log("[requestError]:" + json.status);
			}
			
	　　　　 return $q.reject(json)
	　　 },
		response: function(json) {
			// console.log(json);
			if($rootScope.settings.debug.response){
				console.log("[response]:"+json.status+","+json.config.url);
			}

            var regApi = new RegExp($rootScope.settings.apiPath,'g'),
                regLogicApi = new RegExp($rootScope.settings.logicApiPath,'g');

			if(regApi.test(json.config.url) || 
                regLogicApi.test(json.config.url)){
               
		        if(angular.isDefined(json.data.errorMsg) && json.data.errorMsg != ""){
					toastr["warning"](json.data.errorMsg,"");
					console.log(json);
		        }
			}

			return json || $q.when(json);
		},
		responseError : function(json) {
			if($rootScope.settings.debug.responseError){
				console.log("[responseError]:"+JSON.stringify(json));
			}

			return $q.reject(json);
		}
	};
}]);

/*Restful Factory*/
MetronicApp.factory('$getApi',function($http,$q){
    return function(param){
        var defer = $q.defer();
        $http({
            method:param.method,
            data:param.data,
            url:param.url,
            headers:{
            	'Content-Type':'application/json;charset=utf-8',
            	'Authorization':param.auth
            }
        }).success(function(data,status,headers,config){
            defer.resolve(data);
        }).error(function(data,status,headers,config){
            defer.reject(data)
        });
        return defer.promise
    }
});

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope','$http','$state', function($scope,$http,$state) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });

    $scope.logout = function(){
        $http.get($scope.settings.apiPath + "/logout?token="+localStorage.getItem("t")).success(function(){
        	localStorage.removeItem("t")
        	$state.go('login',{});
        });
        
    }
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Quick Sidebar */
MetronicApp.controller('QuickSidebarController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
       setTimeout(function(){
            QuickSidebar.init(); // init quick sidebar        
        }, 2000)
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {    
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/login");  
    
    $stateProvider
        // login
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",            
            // data: {pageTitle: 'Account Login',name:'xaaa',pwd:'xxx'},
            controller: "LoginController",
         //    controller:function($rootScope,$scope) {
	        //     $rootScope.data = {name:'xxx',pwd:'yyyy'}
	        // },
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'AccountLogin',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/pages/css/login-4.min.css',
                            '../assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            '../assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                            '../assets/global/plugins/jpkleemans-angular-validate/dist/angular-validate.min.js',
                            '../assets/global/plugins/select2/js/select2.full.min.js',
                            '../assets/global/plugins/backstretch/jquery.backstretch.min.js',
                            'js/controllers/LoginController.js',
                        ] 
                    });
                }]
            }
        })

        // Dashboard
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",            
            data: {pageTitle: 'Admin Dashboard Template'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/pages/css/pricing.min.css',                            
                            '../assets/global/plugins/morris/morris.min.js',
                            '../assets/global/plugins/morris/raphael-min.js',                            
                            '../assets/global/plugins/jquery.sparkline.min.js',

                            '../assets/pages/scripts/dashboard.min.js',
                            'js/controllers/DashboardController.js',
                        ] 
                    });
                }]
            }
        })
        // products
        .state('products', {
            url: "/product/list",
            templateUrl: "views/products.html",            
            data: {pageTitle: 'Product Edit'},
            controller: "ProductListController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Product',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '../assets/apps/css/ticket.min.css',
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',                         
                            '../assets/global/plugins/datatables/datatables.min.css',
                            '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

                            '../assets/global/plugins/datatables/datatables.all.min.js',
                            // '//cdn.datatables.net/1.10.7/js/jquery.dataTables.min.js',
                            'js/controllers/ProductListController.js',
                        ] 
                    });
                }]
            }
        })

        // products add
        .state('addproduct', {
            url: "/product/add",
            templateUrl: "views/products_edit.html",            
            data: {pageTitle: 'Product Edit'},
            controller: "ProductController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Product',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            '../assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            '../assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                            '../assets/global/plugins/jpkleemans-angular-validate/dist/angular-validate.min.js',
                            'js/controllers/ProductEditController.js',
                        ] 
                    });
                }]
            }
        })

        // products add
        .state('editproduct', {
            url: "/product/:id",
            templateUrl: "views/products_edit.html",            
            data: {pageTitle: 'Product Edit'},
            controller: "ProductController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'Product',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [

                            '../assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            '../assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                            '../assets/global/plugins/jpkleemans-angular-validate/dist/angular-validate.min.js',
                            'js/controllers/ProductEditController.js',
                        ] 
                    });
                }]
            }
        })



        // AngularJS plugins
        // .state('fileupload', {
        //     url: "/file_upload.html",
        //     templateUrl: "views/file_upload.html",
        //     data: {pageTitle: 'AngularJS File Upload'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'angularFileUpload',
        //                 files: [
        //                     '../assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
        //                 ] 
        //             }, {
        //                 name: 'MetronicApp',
        //                 files: [
        //                     'js/controllers/GeneralPageController.js'
        //                 ]
        //             }]);
        //         }]
        //     }
        // })

        // UI Select
        // .state('uiselect', {
        //     url: "/ui_select.html",
        //     templateUrl: "views/ui_select.html",
        //     data: {pageTitle: 'AngularJS Ui Select'},
        //     controller: "UISelectController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'ui.select',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/angularjs/plugins/ui-select/select.min.css',
        //                     '../assets/global/plugins/angularjs/plugins/ui-select/select.min.js'
        //                 ] 
        //             }, {
        //                 name: 'MetronicApp',
        //                 files: [
        //                     'js/controllers/UISelectController.js'
        //                 ] 
        //             }]);
        //         }]
        //     }
        // })

        // UI Bootstrap
        // .state('uibootstrap', {
        //     url: "/ui_bootstrap.html",
        //     templateUrl: "views/ui_bootstrap.html",
        //     data: {pageTitle: 'AngularJS UI Bootstrap'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 files: [
        //                     'js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })

        // Tree View
        // .state('tree', {
        //     url: "/tree",
        //     templateUrl: "views/tree.html",
        //     data: {pageTitle: 'jQuery Tree View'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/jstree/dist/themes/default/style.min.css',

        //                     '../assets/global/plugins/jstree/dist/jstree.min.js',
        //                     '../assets/pages/scripts/ui-tree.min.js',
        //                     'js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })     

        // Form Tools
        // .state('formtools', {
        //     url: "/form-tools",
        //     templateUrl: "views/form_tools.html",
        //     data: {pageTitle: 'Form Tools'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
        //                     '../assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css',
        //                     '../assets/global/plugins/bootstrap-markdown/css/bootstrap-markdown.min.css',
        //                     '../assets/global/plugins/typeahead/typeahead.css',

        //                     '../assets/global/plugins/fuelux/js/spinner.min.js',
        //                     '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',
        //                     '../assets/global/plugins/jquery-inputmask/jquery.inputmask.bundle.min.js',
        //                     '../assets/global/plugins/jquery.input-ip-address-control-1.0.min.js',
        //                     '../assets/global/plugins/bootstrap-pwstrength/pwstrength-bootstrap.min.js',
        //                     '../assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js',
        //                     '../assets/global/plugins/bootstrap-maxlength/bootstrap-maxlength.min.js',
        //                     '../assets/global/plugins/bootstrap-touchspin/bootstrap.touchspin.js',
        //                     '../assets/global/plugins/typeahead/handlebars.min.js',
        //                     '../assets/global/plugins/typeahead/typeahead.bundle.min.js',
        //                     '../assets/pages/scripts/components-form-tools-2.min.js',

        //                     'js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })        

        // Date & Time Pickers
        // .state('pickers', {
        //     url: "/pickers",
        //     templateUrl: "views/pickers.html",
        //     data: {pageTitle: 'Date & Time Pickers'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/clockface/css/clockface.css',
        //                     '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
        //                     '../assets/global/plugins/bootstrap-timepicker/css/bootstrap-timepicker.min.css',
        //                     '../assets/global/plugins/bootstrap-colorpicker/css/colorpicker.css',
        //                     '../assets/global/plugins/bootstrap-daterangepicker/daterangepicker.css',
        //                     '../assets/global/plugins/bootstrap-datetimepicker/css/bootstrap-datetimepicker.min.css',

        //                     '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
        //                     '../assets/global/plugins/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
        //                     '../assets/global/plugins/clockface/js/clockface.js',
        //                     '../assets/global/plugins/moment.min.js',
        //                     '../assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js',
        //                     '../assets/global/plugins/bootstrap-colorpicker/js/bootstrap-colorpicker.js',
        //                     '../assets/global/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js',

        //                     '../assets/pages/scripts/components-date-time-pickers.min.js',

        //                     'js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // })

        // Custom Dropdowns
        // .state('dropdowns', {
        //     url: "/dropdowns",
        //     templateUrl: "views/dropdowns.html",
        //     data: {pageTitle: 'Custom Dropdowns'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load([{
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/bootstrap-select/css/bootstrap-select.min.css',
        //                     '../assets/global/plugins/select2/css/select2.min.css',
        //                     '../assets/global/plugins/select2/css/select2-bootstrap.min.css',

        //                     '../assets/global/plugins/bootstrap-select/js/bootstrap-select.min.js',
        //                     '../assets/global/plugins/select2/js/select2.full.min.js',

        //                     '../assets/pages/scripts/components-bootstrap-select.min.js',
        //                     '../assets/pages/scripts/components-select2.min.js',

        //                     'js/controllers/GeneralPageController.js'
        //                 ] 
        //             }]);
        //         }] 
        //     }
        // }) 

        // Advanced Datatables
        // .state('datatablesAdvanced', {
        //     url: "/datatables/managed.html",
        //     templateUrl: "views/datatables/managed.html",
        //     data: {pageTitle: 'Advanced Datatables'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [                             
        //                     '../assets/global/plugins/datatables/datatables.min.css', 
        //                     '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',

        //                     '../assets/global/plugins/datatables/datatables.all.min.js',

        //                     '../assets/pages/scripts/table-datatables-managed.min.js',

        //                     'js/controllers/GeneralPageController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // Ajax Datetables
        // .state('datatablesAjax', {
        //     url: "/datatables/ajax.html",
        //     templateUrl: "views/datatables/ajax.html",
        //     data: {pageTitle: 'Ajax Datatables'},
        //     controller: "GeneralPageController",
        //     resolve: {
        //         deps: ['$ocLazyLoad', function($ocLazyLoad) {
        //             return $ocLazyLoad.load({
        //                 name: 'MetronicApp',
        //                 insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        //                 files: [
        //                     '../assets/global/plugins/datatables/datatables.min.css', 
        //                     '../assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css',
        //                     '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',

        //                     '../assets/global/plugins/datatables/datatables.all.min.js',
        //                     '../assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js',
        //                     '../assets/global/scripts/datatable.min.js',

        //                     'js/scripts/table-ajax.js',
        //                     'js/controllers/GeneralPageController.js'
        //                 ]
        //             });
        //         }]
        //     }
        // })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "views/profile/main.html",
            data: {pageTitle: 'User Profile'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.css',
                            '../assets/pages/css/profile.css',
                            
                            '../assets/global/plugins/jquery.sparkline.min.js',
                            '../assets/global/plugins/bootstrap-fileinput/bootstrap-fileinput.js',

                            '../assets/pages/scripts/profile.min.js',

                            'js/controllers/UserProfileController.js'
                        ]                    
                    });
                }]
            }
        })

        // User Profile Dashboard
        .state("profile.dashboard", {
            url: "/dashboard",
            templateUrl: "views/profile/dashboard.html",
            data: {pageTitle: 'User Profile'},
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "views/profile/account.html",
            data: {pageTitle: 'User Account'}
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "views/profile/help.html",
            data: {pageTitle: 'User Help'}      
        })

        // task
        .state('task', {
            url: "/task",
            templateUrl: "views/task/main.html",
            data: {pageTitle: 'Task'},
            controller: "TaskController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css',
                            '../assets/apps/css/todo-2.css',
                            '../assets/global/plugins/select2/css/select2.min.css',
                            '../assets/global/plugins/select2/css/select2-bootstrap.min.css',

                            'js/controllers/TaskController.js'  
                        ]                    
                    });
                }]
            }
        })

        // User Profile Help
        .state("task.dashboard", {
            url: "/dashboard",
            templateUrl: "views/task/dashboard.html",
            data: {pageTitle: 'Task Dashboard'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/counterup/jquery.waypoints.min.js',
                            '../assets/global/plugins/morris/raphael-min.js',
                            '../assets/global/plugins/amcharts/amcharts/amcharts.js'
                        ]
                    }).then(function(){
                        return $ocLazyLoad.load({
                            name: 'MetronicApp',  
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files:[
                            '../assets/global/plugins/amcharts/ammap/maps/js/worldLow.js',
                            '../assets/global/plugins/jqvmap/jqvmap/jquery.vmap.js',
                            '../assets/global/plugins/jqvmap/jqvmap/maps/jquery.vmap.russia.js',
                            '../assets/global/plugins/jqvmap/jqvmap/maps/jquery.vmap.world.js',
                            '../assets/global/plugins/jqvmap/jqvmap/maps/jquery.vmap.europe.js',
                            '../assets/global/plugins/jqvmap/jqvmap/maps/jquery.vmap.germany.js',
                            '../assets/global/plugins/jqvmap/jqvmap/maps/jquery.vmap.usa.js',
                            '../assets/global/plugins/jqvmap/jqvmap/data/jquery.vmap.sampledata.js']
                        })
                    });
                }]
            }    
        })

        // User Profile Help
        .state("task.add", {
            url: "/add",
            templateUrl: "views/task/task-detail.html",
            data: {pageTitle: 'Task Detail'},
            controller: "TaskDetailController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({ 
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../assets/global/plugins/jquery-validation/js/jquery.validate.min.js',
                            '../assets/global/plugins/jquery-validation/js/additional-methods.min.js',
                            '../assets/global/plugins/jpkleemans-angular-validate/dist/angular-validate.min.js',
                        ]
                    })
                }]
            }    
        })

}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view

    toastr.options = {
      "closeButton": true,
      "debug": false,
      "positionClass": "toast-top-center",
      "onclick": null,
      "showDuration": "1000",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };

}]);