/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
MetronicApp.directive('ngSpinnerBar', ['$rootScope','$http','$state',
    function($rootScope,$http,$state) {
        return {
            link: function(scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar

                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu

                    //login view
                    if($rootScope.$state.current.name === 'login'){
                        $rootScope.loginPage = true;
                        $('body').addClass('login');
                        $('#ui_container').removeClass('page-content').removeAttr('style');//.appendTo($('body'));
                        
                        return;
                    }else{
                        $rootScope.loginPage = false; 
                        $('body').removeClass('login');
                        $('#ui_container').addClass('page-content');
                        $('.backstretch').remove();
                    }


                    //check auth localsotrage
                    if(typeof(localStorage["t"]) == 'undefined'){
                        $state.go('login');
                        return;
                    }

                    //check auth api
                    var data = JSON.stringify({
                        "token": localStorage["t"]
                    });

                    $http.post($rootScope.settings.apiPath+"/AuthToken",data)
                    .success(function(json){
                        
                        if( typeof(json.success) == 'undefined' || !json.success){
                            $state.go('login');
                            return;
                        }

                    });
                   
                    // auto scorll to page top
                    setTimeout(function () {
                        App.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])

// Handle global LINK click
MetronicApp.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function(e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
    link: function (scope, elem) {
      elem.dropdownHover();
    }
  };  
});