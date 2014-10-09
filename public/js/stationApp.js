window.onload = function(){
      SC.initialize({
        client_id: "d00547f88a72d9a987b70342928f1a61"
    });
};

var app = angular.module('station', ['ui.bootstrap']);

var currentTrack;
app.controller('bodyController', 
    [
        '$scope',
        '$http',
        '$window',
        function($scope, $http, $window){
            
            $scope.songs = [];
            $scope.results = [];
            $http.get('/station/' + localStorage.getItem('stationId')).
                success(
                    function(data, status){
                        if(data.station.songs){
                           // setTimeout(setupSongs(data.station.songs), 100000);
                            setupSongs(data.station.songs);
                        }
                    }
                ).
                error(
                    function(data, status){
                        console.log(data);
                    }
                );
            
            function setupSongs(songs){
                if(songs.length > 0){
                    var ids = songs[0].songId;
                    for(var i = 1; i < songs.length; i++){
                        ids += "," + songs[i].songId;
                    }
                        getTracks(ids);
               
                }
            }
            
            function getTracks(ids){
               SC.get('/tracks',{ids : ids},
                        function(tracks) {
                            if(tracks.errors){
                                getTracks(ids);
                                return;
                            }
                            var track;
                            for(var i = 0; i < tracks.length; i++){
                                track = {
                                    title : tracks[i].title,
                                    artwork : tracks[i].artwork_url,
                                    artist : tracks[i].user.username,
                                    description:tracks[i].description,
                                    songId : tracks[i].id,
                                    url : tracks[i].stream_url
                                };
                                $scope.songs.push(track);
                            }
                            $scope.$apply();
                            qmanager($scope.songs[0]);
                            /*
                            SC.stream($scope.songs[0].url, function(sound){
                                sound.play();
                            });
                            $scope.songs.shift();
                            $scope.$apply();*/
                            //soundcloud.getPlayer("myPlayer");
                        }
                    ); 
            }
            
            function qmanager(song){
                SC.stream(song.url, {onfinish:
                            function(){
                                $scope.songs.shift();
                                $scope.$apply();
                                qmanager($scope.songs[0]);
                            }}, 
                        function(sound){
                            currentTrack = sound;
                            sound.play();
                        });
            }
            
           $scope.next = function (){
               currentTrack.stop();
               $scope.songs.shift();
               SC.stream($scope.songs[0].url, {onfinish:
                    function(){ 
                            $scope.songs.shift();
                            $scope.$apply();
                            qmanager($scope.songs[0]);
                        }}, 
                    function(sound){
                        currentTrack = sound;
                        sound.play();
                    }
                );
           };
           
            $scope.search = function(text) {
                SC.get('/tracks', {'q' : text},
                    function(tracks){
                        for(var i = 0; i < tracks.length; i++){
                            var track = {
                                title : tracks[i].title,
                                artwork : tracks[i].artwork_url,
                                artist : tracks[i].user.username,
                                songId : tracks[i].id,
                                url : tracks[i].stream_url
                            };
                            $scope.results.push(track);
                        }
                        $scope.$apply();
                    }
                );
            };
            
            $scope.addSong = function(i){
                var song = {
                    songId : $scope.results[i].songId,
                    title : $scope.results[i].title,
                    artist : $scope.results[i].artist,
                    artwork : $scope.results[i].artwork
                };
                var postData = {
                    stationId : localStorage.getItem('stationId'),
                    'song' : song
                };
                $http.post('/newSong', postData).
                    success(
                        function(data, status){
                            console.log(data.song);
                            $scope.songs.push(data.song);
                        }
                    ).
                    error(
                        function(data, status){
                            //TODO handle error
                        }
                    );
                //$scope.songs.push($scope.results[i]);
                $scope.results = [];
                //$scope.$apply();
            };
            
            $scope.isPlaying = false;
            
            $scope.pause= function(){
                currentTrack.pause();
                $scope.isPlaying = true;
            }; 
            
            $scope.play = function(){
                currentTrack.play();
                $scope.isPlaying = false;
            };
            
            
        }
    ]
);
app.controller('songsController', 
    [
        '$scope',
        '$http',
        '$window',
        function($scope, $http, $window){
            
        }
    ]
);

//prueba


app.controller('ModalDemoCtrl', function ($scope, $modal, $log) {
  
  
  $scope.items = [{name:"juanda",
                        id:123,
                        picture:"https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xpa1/v/t1.0-1/r180/p50x50/994478_10203871345159922_4483923506299465616_n.jpg?oh=9ca995da60254972a51e1ffc31ddce6c&oe=54B5844C&__gda__=1421252505_e788835e0c185215f4f726141ae055c0",
                        selected:false}];
  $scope.friends = [];
  
  $scope.addFriend = function(){
        FB.api(
           "/me/friends?fields=id,name,picture",
           function (response) {
             if (response && !response.error) {
                 $scope.items=[];
                 response.data.forEach(function(friend) {
                    //console.log(friend);
                    var obj ={
                        name:friend.name,
                        id:friend.id,
                        picture:friend.picture,
                        selected:false
                    };
                    $scope.items.push(obj  );
                });
                //globalFriends = $scope.items;
                $scope.$apply();
                $scope.open();
             }
           }
       );
   };
  

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      resolve: {
        items: function () {
          console.log($scope.items);
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

app.controller('ModalInstanceCtrl', function ($scope, $http,$modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
    console.log( "ok");
    for(var i = 0; i < $scope.items.length;i++){
        if($scope.items[i].selected==true){
            var Station = {
                stationName : localStorage.getItem('stationName'), 
                desc : 'Invited.',
                staionId : localStorage.getItem('stationId'),
                userId : $scope.items[i].id
            };
            $http.post('/invite', Station).
                success(
                //$http.post('http://localhost:8888/newStation', {'newStation' : newStation}).success(
                    function(data, status){
                        console.log("done");
                    }
                ).
                error(
                    function(data, status){
                        console.log(data);
                    }
                );
        }
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
    console.log( "cancel");
    console.log(localStorage.getItem('stationName'))
  };
  
  $scope.selectFriend = function(i){
    console.log("heal yes "+i);
    $scope.items[i].selected=!$scope.items[i].selected;
    console.log($scope.items);
  };
});



