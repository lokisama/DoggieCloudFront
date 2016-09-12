angular.module('MetronicApp')
.controller('ProductListController', function($rootScope, $scope, $http, $timeout,$state) {
    
    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components
        // TableDatatablesManaged.init();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;

    console.log("ProductListController");

    var table = $('#sample_1');

        // begin first table
        table.DataTable({

            // Internationalisation. For more info refer to http://datatables.net/manual/i18n
            "language": {
                "aria": {
                    "sortAscending": ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                },
                "emptyTable": "空表",
                "info": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
                "infoEmpty": "没有数据",
                "infoFiltered": "(从 _MAX_ 条数据中检索)",
                "lengthMenu": "每页显示 _MENU_ 条记录",
                "search": "查询:",
                "zeroRecords": "无查询结果",
                "sProcessing": "正在加载中...", 
                "paginate": {
                    "previous":"上一页",
                    "next": "下一页",
                    "last": "尾页",
                    "first": "首页"
                }
            },
            "aoColumns": [
                  {
                      data:   "itemId",
                      render: function ( data, type, row ) {
                          if ( type === 'display' ) {
                              return '<input type="checkbox" class="group-checkable" />';
                          } else if(type === 'filter'){
                              return 'filter';
                          } else if(type === 'set'){
                             return 'set';
                          }
                          return data;
                      },
                      sWidth: '30px'
                  },

                  { 
                      data: 'picUrls',
                      sWidth: '100px',
                      render: function ( data, type, row ) {
                          if ( type === 'display' ) {
                              return "<img src='"+ data+"' style='width:100px;'/>";
                          }
                          return data;
                      },
                  },
                  { data: 'name', sWidth: '200px'},
                  { data: 'title', sWidth: '200px' },
                  { 
                    data: 'value',
                    render: function(data, type, row){
                      
                      if ( type === 'display' ) {
                              return row.currency + data;
                          }
                          return data;
                    }, 
                    sWidth: '50px'
                  },
                  { 
                    data: 'checkOutUrl',
                    render: function(data, type, row){
                      
                      if ( type === 'display' ) {
                        var pattern = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;
                        var result = pattern.exec(data);
                        return '<a target="_blank" href="'+ data +'">'+result[4]+'</a>';
                              
                        }
                        return data;
                    }
                  },
                  { data: 'note', sWidth: '100px' },
                  { 
                    data: 'itemId',
                    render: function(data, type, row){
                      
                      if ( type === 'display' ) {
                        return '<button class="btn btn-default" action="edit">查看</button>';
                              
                      }
                      return data;
                    }, 
                    sWidth: '50px'
                  },
                  { 
                    data: 'itemId',
                    render: function(data, type, row){
                      
                      if ( type === 'display' ) {
                        return '<button class="btn red" action="delete">删除</button>';
                              
                      }
                      return data;
                    }, 
                    sWidth: '50px'
                  }
              ],
            "bProcessing": true,
            "bServerSide": true,
            "bPaginate" : true,
            "bInfo" : true,
            "sServerMethod": "POST", 
            // "sPaginationType": "full_numbers",
            "sAjaxSource": $rootScope.settings.logicApiPath + "/queryItemInfo",
            "ajax":{
              "dataSrc": 'recList'
            },
            "fnServerParams": function (aoData) {
                var data = {key: "",itemId:"",pageSize:10,pageNum:0};
            }, 
            //如果加上下面这段内容，则使用post方式传递数据
            "fnServerData": function ( sSource, aoData, fnCallback ) {
              // aoData.push({key: "",itemId:"",pageSize:10,pageNum:0}); 
            
              var key = aoData[45].value,
              pageSize = aoData[4].value,
              pageNum = aoData[3].value/aoData[4].value;
             
              for(var i=0;i<aoData.length;i++){
                if(aoData[i].name==='sSearch'){
                  key = aoData[i].value;
                }
              }

              $.ajax({
                  url: sSource,
                  type: 'POST',
                  data: JSON.stringify({key: key ,pageSize:pageSize ,pageNum:pageNum}),
                  dataType:"json",
                  contentType:"application/json; charset=UTF-8",
                  beforeSend: function (request) {
                      request.setRequestHeader("Authorization", localStorage['t']);
                      request.setRequestHeader("Content-Type", 'application/json;charset=utf-8');
                  },
                  success: function(resp){
                      resp["recordsTotal"] = resp.totalRecs;
                      resp["recordsFiltered"] = resp.totalRecs;
                      
                      fnCallback(resp);    
                  },
                  error: function(XMLHttpRequest, textStatus, errorThrown){
                      console.log(textStatus);
                  }
              });
            },
            "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
              
              $("button[action=delete]", nRow).click(function() {

                if(!confirm("确定要删除记录吗?")){
                    return false
                }
                console.log(aData.itemId, iDisplayIndex);
                
                var url=$rootScope.settings.logicApiPath + "/delItemInfo?itemId="+aData.itemId,
                    headers = {"headers":{"Authorization":localStorage['t']}};

                $http.get(url,headers).then(function(json){
                    $(nRow).remove();
                    table.DataTable().ajax.reload();
                })

              });


              $("button[action=edit]", nRow).click(function() {
                $state.go("editproduct",{id:aData.itemId});
              });

              return nRow;
            },

            "bStateSave": true, // save datatable state(pagination, sort, etc) in cookie.

            "lengthMenu": [
                [5, 15, 20, -1],
                [5, 15, 20, "All"] // change per page values here
            ],
            // // set the initial value
            // "pageLength": 3 ,            
            // "pagingType": "bootstrap_full_number",
            "columnDefs": [{  // set default column settings
                'orderable': false,
                'targets': [0,7,8]
            }, {
                "searchable": true,
                "targets": [0]
            }],
            // "order": [
            //     [1, "asc"]
            // ] // set first column as a default sort by asc
        });

        // var tableWrapper = jQuery('#sample_1_wrapper');

        // table.find('.group-checkable').change(function () {
        //     var set = jQuery(this).attr("data-set");
        //     var checked = jQuery(this).is(":checked");
        //     jQuery(set).each(function () {
        //         if (checked) {
        //             $(this).prop("checked", true);
        //             $(this).parents('tr').addClass("active");
        //         } else {
        //             $(this).prop("checked", false);
        //             $(this).parents('tr').removeClass("active");
        //         }
        //     });
        //     jQuery.uniform.update(set);
        // });

        // table.on('change', 'tbody tr .checkboxes', function () {
        //     $(this).parents('tr').toggleClass("active");
        // });
        // console.log(table._fnAjaxUpdateDraw());

});