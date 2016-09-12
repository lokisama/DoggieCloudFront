var Dashboard = function() {

    return {

        initJQVMAP: function() {
            if (!jQuery().vectorMap) {
                return;
            }

            var showMap = function(name) {
                jQuery('.vmaps').hide();
                jQuery('#vmap_' + name).show();
            }

            var setMap = function(name) {

                var map = jQuery('#vmap_' + name);
                
                console.log(map.size());
                if (map.size() !== 1) {
                    return;
                }

                var data = {
                    map: 'world_en',
                    backgroundColor: null,
                    borderColor: '#333333',
                    borderOpacity: 0.5,
                    borderWidth: 1,
                    color: '#c6c6c6',
                    enableZoom: true,
                    hoverColor: '#c9dfaf',
                    hoverOpacity: null,
                    values: sample_data,
                    normalizeFunction: 'linear',
                    scaleColors: ['#b6da93', '#909cae'],
                    selectedColor: '#c9dfaf',
                    selectedRegion: null,
                    showTooltip: true,
                    onLabelShow: function(event, label, code) {

                    },
                    onRegionOver: function(event, code) {
                        if (code == 'ca') {
                            event.preventDefault();
                        }
                    },
                    onRegionClick: function(element, code, region) {
                        var message = 'You clicked "' + region + '" which has the code: ' + code.toUpperCase();
                        alert(message);
                    }
                };

                data.map = name + '_en';
              
                map.width(map.parent().parent().width());
                map.show();
                map.vectorMap(data);
                map.hide();



            }

               
            setMap("world");
            setMap("usa");
            setMap("europe");
            setMap("russia");
            setMap("germany");
            showMap("world");
            jQuery('#regional_stat_world').click(function() {
                showMap("world");
            });

            jQuery('#regional_stat_usa').click(function() {
                showMap("usa");
            });

            jQuery('#regional_stat_europe').click(function() {
                showMap("europe");
            });
            jQuery('#regional_stat_russia').click(function() {
                showMap("russia");
            });
            jQuery('#regional_stat_germany').click(function() {
                showMap("germany");
            });

            $('#region_statistics_loading').hide();
            $('#region_statistics_content').show();

            App.addResizeHandler(function() {
                jQuery('.vmaps').each(function() {
                    var map = jQuery(this);
                    map.width(map.parent().width());
                });
            });
        },

        initWorldMapStats: function() {
            if ($('#mapplic').size() === 0) {
                return;
            }

            $('#mapplic').mapplic({
                source: '../assets/global/plugins/mapplic/world.json',
                height: 265,
                animate: false,
                sidebar: false,
                minimap: false,
                locations: true,
                deeplinking: true,
                fullscreen: false,
                hovertip: true,
                zoombuttons: false,
                clearbutton: false,
                developer: false,
                maxscale: 2,
                skin: 'mapplic-dark',
                zoom: true
            });

            
        },

        init: function() {
            this.initJQVMAP();
            this.initWorldMapStats();
        }
    };

}();

angular.module('MetronicApp')

.controller('TaskController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components 
        // Dashboard.init(); 
    });
    console.log('TaskController');

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    $scope.taskList={
        "-1" :[],
        "0":[],
        "1":[],
        "2":[],
        "3":[]
    };

    var getTaskStateName = function(idx){
        var name= {
            "-1": "任务错误",
            "0" : "任务已经创建",
            "1" : "任务正在处理",
            "2" : "任务发生错误已经终止",
            "3" : "任务完成"
        }
        return name[idx];
    }

    var data = JSON.stringify({
        "pageSize":10,
        "pageNum": 0,
        "state":null,
        "detailLevel":4
    });

    $scope.getTaskByGroup = function(idx){
        $scope.taskShowList = $scope.taskList[idx];
        $scope.taskStateName = getTaskStateName(idx);
    }

    $http.post($rootScope.settings.logicApiPath + "/task/queryTask",data,{headers:{"Authorization":localStorage['t']}})
    .success(function(response){
        
        for(var i=0;i<response.taskList.length;i++){
            var idx = response.taskList[i].taskState;
            if(angular.isUndefined($scope.taskList[idx])){
                $scope.taskList[idx] = [];
            }

            $scope.taskList[idx].push(response.taskList[i]);
        }
        $scope.taskShowList = $scope.taskList[0];
        $scope.taskStateName = getTaskStateName(0);
    })

    

})

.controller('TaskDetailController', function($rootScope, $scope, $http, $timeout) {
    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components 
        // Dashboard.init(); 
    });
    console.log('TaskDetailController');

    $scope.itemList=[];
    $scope.request = {
        requiredNum:0,
        countryCode:"",
        itemIdList:[]
    };

    $scope.addToItemList = function(product){
        $scope.itemList.push(product);
        $scope.request.itemIdList.push(product.itemId);
    }

    $scope.save = function(form){
        console.log($scope.request);

        $http.post($rootScope.settings.logicApiPath + "/task/createTask",
            JSON.stringify($scope.request), {headers:{"Authorization":localStorage['t']}})
        .success(function(response){
            console.log(response);
        });
    }
    
   
    $scope.queryItemInfo = function(key,pageSize,pageNum){
        $http.post($rootScope.settings.logicApiPath + "/queryItemInfo",
            JSON.stringify({key: key ,pageSize:pageSize ,pageNum:pageNum}),
            {headers:{"Authorization":localStorage['t']}})
        .success(function(response){
            console.log(response);
            $scope.list = response.recList;
        });
    }

    $scope.queryItemInfo("",9,0);

});