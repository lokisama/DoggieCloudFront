angular.module('MetronicApp').controller('UserProfileController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu 
        
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = false;
    $rootScope.settings.layout.pageBodySolid = false;

    var headers = {
        "headers":{"Authorization":localStorage['t']}
    };

    //queryAccountInfo
    $http.get($rootScope.settings.logicApiPath + "/queryAccountInfo",headers).success(function(json){
        $rootScope.account = json;
    });


    //queryAccountInfo
    var data = JSON.stringify({
       "pageSize":10,
       "pageNum":1
    });

    $http.post($rootScope.settings.logicApiPath + "/queryDCRec",data,headers).success(function(json){
        if(json.errorMsg !== ''){
            return;
        }
    });





}); 
