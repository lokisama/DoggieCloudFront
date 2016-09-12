angular.module('MetronicApp',['ngValidate'])

.controller('ProductController', function($rootScope, $scope, $http, $timeout,$state,$filter) {
    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components        
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    //edit
    if(!angular.isUndefined($state.params.id)){
        var headers = {"headers":{"Authorization":localStorage['t']}},
            request = {
              "key": $state.params.id,
              "itemId":"",
              "pageSize":10,
              "pageNum":0
            };

        $http.post($rootScope.settings.logicApiPath + "/queryItemInfo",request,headers).success(function(json){
            
            if(json.errorMsg !== ''){
              return;
            }

            if(json.recList.length > 0){
              $scope.data = json.recList[0];
            }
            
        });
    }

    $scope.reset = function(){
        $scope.data = {
          "itemId": "",
          "name":"",
          "title":"",
          "picUrls":"",
          "checkOutUrl":"",
          "value":0,
          "currency":"",
          "description":"",
          "note":""
        };
    }

    $scope.validationOptions = {
      rules: {
          name: {
              required: true
          },
          title: {
              required: true
          },
          picUrls: {
              required: true
          },
          checkOutUrl: {
              required: true
          },
          value: {
              required: true,
              number:true
          },
          currency: {
              required: true
          }
      }
    }

    $scope.save = function(form){
        
        if(!form.validate()) {
          return;
        }
        var headers = {
            "headers":{"Authorization":localStorage['t']}
        };

        $http.post($rootScope.settings.logicApiPath + "/saveItemInfo",$scope.data,headers).success(function(json){
            if(json.errorMsg !== ''){
             return;
            }
            $state.go('products');
        });
    }
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
