angular.module('MetronicApp').controller('DashboardController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    $scope.charge = function(){
    $http.get($rootScope.settings.logicApiPath + "/testCharge",{headers:{"Authorization":localStorage['t']}})
	    .success(function(response){
	    	toastr["success"]("成功充值1000刀弟币","");
	    })
	}


});