angular.module('MetronicApp',['ngValidate'])

.controller('LoginController', function($rootScope,$scope, $http, $state) {
    
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        App.initAjax();
        $.backstretch([
            "../assets/pages/media/bg/1.jpg",
            "../assets/pages/media/bg/2.jpg",
            "../assets/pages/media/bg/3.jpg",
            "../assets/pages/media/bg/4.jpg"
            ], {
              fade: 1000,
              duration: 8000
            }
        );

    });

    $scope.data = {name : 'doggie', pwd : '111111'};

    $scope.forgetShow = function(){
        $scope.data={};
        $('.login-form').hide();
        $('.forget-form').show();
    }

    $scope.forgetBack = function(){
        
        $('.login-form').show();
        $('.forget-form').hide();
    }

    $scope.registerShow = function(){
        $scope.data={};
        $('.login-form').hide();
        $('.register-form').show();
    }

    $scope.registerBack = function(){
        
        $('.login-form').show();
        $('.register-form').hide();
    }

    $scope.validationOptions = {
        rules: {
            username: {
                required: true
            },
            password: {
                required: true,
                minlength: 4
            },
            username: {
                required: true
            },
            rpassword: {
                equalTo: "#register_password"
            },
            tnc: {
                required: true
            }
        }
    }
    
    $scope.login = function (form) {
        
        console.log($scope.data);

        if(!form.validate()) {
            return;
        }

        var data = {
           "name":$scope.data.name,
           "pwd":$scope.data.pwd
        };

        $http.post($rootScope.settings.apiPath + "/login",data).success(function(json) {

            if(typeof(json.errorMsg) == 'string' && json.errorMsg != ""){
                return;
            }

            toastr["success"]("登录成功","");
            localStorage.setItem("t",json.token);
            // $httpProvider.defaults.headers.post['Authorization'] = localStorage.getItem("t");
            $state.go('profile.account',{});
       });
    }

    $scope.register =  function (form) {
        
        if(!form.validate()) {
            return;
        }
        
        var data = JSON.stringify({
           "name":$scope.data.name,
           "password":$scope.data.password
        });

        $http.post($rootScope.settings.apiPath + "/createUser",data).success(function(json) {

            if(typeof(json.errorMsg) == 'string' && json.errorMsg != ""){
                return;
            }

            toastr["success"]("注册成功","");
            $scope.registerBack();
       });
    }

    $scope.forgetPassword =  function (form) {

        if(!form.validate()) {
            return;
        }
        
        // var data = JSON.stringify({
        //    "pwd":$rootScope.data.newpassword
        // });

  //       $http.post($rootScope.settings.apiPath + "/login",data).success(function(json) {
           
     //       toastr["success"]("登录成功","");
     //   });
    }

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

})

.config(function ($validatorProvider) {
    $validatorProvider.setDefaults({
        errorElement: 'span',
        errorClass: 'help-block',
        highlight: function (element) { // hightlight error inputs
            $(element)
                .closest('.form-group').addClass('has-error'); // set error class to the control group
        },

        success: function (label) {
            label.closest('.form-group').removeClass('has-error');
            label.remove();
        },

        errorPlacement: function (error, element) {
            if (element.attr("name") == "tnc") { // insert checkbox errors after the container                  
                error.insertAfter($('#register_tnc_error'));
            } else if (element.closest('.input-icon').size() === 1) {
                error.insertAfter(element.closest('.input-icon'));
            } else {
                error.insertAfter(element);
            }
        },

        success:function(error, element){
            $(error).parents(".form-group").removeClass("has-error");
            $(error).remove();
        }
    });

    $validatorProvider.setDefaultMessages({
        required: "请输入必填项.",
        remote: "请修改.",
        email: "错误邮箱格式.",
        url: "错误url格式.",
        date: "错误时间格式.",
        dateISO: "错误ISO时间格式.",
        number: "非法数字格式.",
        digits: "Please enter only digits.",
        creditcard: "请输入正确信用卡格式.",
        equalTo: "2次输入不一致.",
        accept: "请输入正确验证信息.",
        tnc: "请先阅读政策",
        maxlength: $validatorProvider.format("最大不超过 {0} 位."),
        minlength: $validatorProvider.format("最小不超过 {0} 位."),
        rangelength: $validatorProvider.format("可以输入 {0} 到 {1} 位."),
        range: $validatorProvider.format("可输入 {0} 到 {1}."),
        max: $validatorProvider.format("不大于 {0}."),
        min: $validatorProvider.format("不小于 {0}.")
    });
});
