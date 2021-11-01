angular.module('myApp', []).factory('socket', [function() {
  var stack = [];
  var onmessageDefer;
  var socket = {
      ws: new WebSocket('ws://104.251.211.231:3001/ws'),
      send: function(data) {
          data = JSON.stringify(data);
          if (socket.ws.readyState == 1) {
              socket.ws.send(data);
          } else {
              stack.push(data);
          }
      },
      onmessage: function(callback) {
          if (socket.ws.readyState == 1) {
              socket.ws.onmessage = callback;
          } else {
              onmessageDefer = callback;
          }
      }
  };
  socket.ws.onopen = function(event) {
      for (i in stack) {
          socket.ws.send(stack[i]);
      }
      stack = [];
      if (onmessageDefer) {
          socket.ws.onmessage = onmessageDefer;
          onmessageDefer = null;
      }
  };
  return socket;
}]).controller('userCtrl', function($scope,$http,socket) {
     

    $scope.name = '';
    $scope.id = '';
    $scope.passw1 = '';
    $scope.passw2 = '';
    $scope.idDb = ''; 
    $scope.edit = true;
    $scope.error = false;
    $scope.incomplete = false;
    $scope.hideform = true;
    $scope.qrcode = false;
    $scope.dataqr = '';
    $scope.editUser = function(user) {
      $scope.hideform = false;
      $scope.edit = false; 
      $scope.hasConnection(user.idtl);
      $scope.name = user.name;
      $scope.idtl = user.idtl;
      $scope.passw1 = '';
      $scope.idDb = ''; 
    };
    socket.send("ping");
    socket.onmessage(function(event) {
      var data = JSON.parse(event.data);
      switch (data.event) {
        case "qrcode":
          $scope.qrcode = true;
          $scope.dataqr = data.data;
          $scope.$apply();
          break;
          case "closeqrcode":
            $scope.qrcode = false;
            $scope.test();
            $scope.$apply();
          break;
      
        default:
          break;
      }
  });

    $scope.$watch('passw1',function() {$scope.test();});
 
    $scope.setTl = function(id = 0,idwpp,idtl) {
      
        if( $scope.idDb == ''){
            $http({
                method: 'GET',
                url: '/set?idwpp='+idwpp+'&idtl='+idtl
              }).then(function successCallback(response) {
                $scope.idDb = 'zero';
                // $scope.users = response.data
                }, function errorCallback(response) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
            });
        }else{
            console.log(idwpp);
            $http({
                method: 'GET',
                url: '/update?id='+id+'&idwpp='+idwpp+'&idtl='+idtl
              }).then(function successCallback(response) {
                // $scope.users = response.data
                }, function errorCallback(response) {
                  // called asynchronously if an error occurs
                  // or server returns response with an error status.
            });

        }
    
    };


    $scope.hasConnection= function(idwpp) {
        $http({
            method: 'GET',
            url: '/hasconnection?idwpp='+idwpp
          }).then(function successCallback(response) {
            if(response.data.length > 0 ){
                $scope.passw1 = response.data[0].tlid;
                $scope.idDb = response.data[0].id;
            }
              
            // $scope.users = response.data
            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
    };

    $scope.test = function() {
        $http({
            method: 'GET',
            url: '/result'
          }).then(function successCallback(response) {
            $scope.users = response.data
            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
            });
    };
    
    });