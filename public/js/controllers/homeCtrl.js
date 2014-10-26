app.controller('homeCtrl', [
    '$scope',
    '$http',
    '$state',
    '$modal',
    '$timeout',
    function($scope, $http, $state, $modal, $timeout){
        $scope.username="";
        $scope.userId;
        $scope.stations = [];
        $scope.showCreateStation = true;
        $scope.invitations =[];
        
        FB.getLoginStatus(
            function(response1) {
                if (response1 && !response1.error) {
                    FB.api(
                    "/me",
                    function (response) {
                        if(response.id){
                            $http.get('/home/' + response.id).
                                success(
                                    function(data, status){
                                        //TODO change to angular
                                        $("#hello").append(response.first_name);
                                        $scope.username = response.first_name;
                                        usr = $scope.userId=response.id;
                                        poller();
                                        $scope.stations = data.stations;
                                        setupData();
                                    }
                                ).
                                error(
                                    function(data, status){
                                        //console.log('Server returned with status ' + status + ': ' + data);
                                    }
                                );
                        }
                        else{
                            $state.go('login');
                        }
                    });
                }
            }
        );
                
        function setupData(){
            $scope.stationsMap = [];
            for(var i = 0; i < $scope.stations.length; i++){
                $scope.stationsMap[$scope.stations[i].stationName] = $scope.stations[i];
            }
        }

        $scope.goToStation = function(id, stationName){
//            localStorage.setItem('stationId', id);
//            localStorage.setItem('stationName', stationName);
            $state.go('station', {stationId : id, 'stationName' : stationName});
//            $window.location.href = '/station.html';
        };
        
        
        $scope.showCreate = function(){
            $scope.showCreateStation = !$scope.showCreateStation;
        };
        
        $scope.createNewStation = function(){
            if($scope.stationName != ''){
                var newStation = {'stationName' : $scope.newStationName, desc : 'Fresh.'};
                $http.post('/newStation', newStation).
                    success(
                        function(data, status){
                            $scope.stations.push(data);
                        }
                    ).
                    error(
                        function(data, status){
                        }
                    );
            }
        };
            
          
        $scope.removeStation  = function (station) {

            var modalInstance = $modal.open({
                templateUrl: 'myModalContent.html',
                controller: 'ModalRemoveStationInstanceCtrl'
            });

            modalInstance.result.then(function (deleted) {
              if(deleted){
                    var btn = $(this);
                    btn.button('loading');
                    $http.get('/removeStation/' + station._id+'/'+ $scope.userId +'/'+station.description).
                    success(
                        function (data,status){ 
                            var index = $scope.stations.indexOf(station);
                            if(index>-1){
                                $scope.stations.splice(index, 1);
                            }
                        }
                    ).
                    error(
                        function(data, status){
                        }
                    );
              }
            },
            function () {
//                $log.info('Modal dismissed at: ' + new Date());
            });
        };
            
        var poller = function() {
            console.log("poll");
            var loaded = $scope.invitations ;
            $http.get('/invitation/'+$scope.userId+'/'+JSON.stringify(loaded)).
                success(
                    function(data,status) {
                        if(data.notifications){
                            for(var i = 0; i < data.notifications.length; i++){
                                $scope.invitations.push(data.notifications[i]);
                                console.log(data.notifications[i]);
                                $("#invitations").append(
                                "<li role=\"presentation\" class=\"dropdown-header\">"+data.notifications[i].stationName+"<br>"+
                                    "<button class=\"btn btn-primary\" onclick=\"answerInvitation("+i+",true)\">Accept</button>"+
                                    "<button class=\"btn btn-warning\" onclick=\"answerInvitation("+i+",false)\">Cancel</button>"+
                                "</li>");
                            }
                            inv =  $scope.invitations;
//                          TODO cahnge to angular
                        }
                        $timeout(poller, 1000);
                    }
                );
        };
    }]
);

var inv;
var answerInvitation = function(i, b){
    var ainv =[];
    var send = inv[i];
    for (var j=0;j<inv.length;j++){
        if(i!=j){
            ainv.push(inv[j]);
        }
    }
    inv = ainv;
    $.ajax({url:'/answer/'+i+"/"+JSON.stringify(send)+"/"+usr,type:'GET'}).success(function(data,status) {
        console.log(data);
    });
};

app.controller('ModalRemoveStationInstanceCtrl', function ($scope, $modalInstance) {

    $scope.ok = function () {
        $modalInstance.close(true);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

