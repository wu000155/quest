var goTimer;
var joinQuest={
     joinQuestPage: function () {
        console.log("joinQuestPage");
         clearInterval(goTimer);
         goTimer = null;
         var uri= "http://m.edumedia.ca/wu000155/geo/join-quests.php";
         var user_id=localStorage.getItem('user_id');
         var data = new FormData();
            data.append('user_id', user_id);
          var request = new XMLHttpRequest();
            request.open('POST', uri, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 || request.readyState == "complete") {
                    if (request.status === 200 || request.status === 0) {
                        var result = request.responseText;
                        console.log(result);
                        
                        console.log(JSON.parse(result).code);
                        if (JSON.parse(result).code == 0) {
                            var values = JSON.parse(result).values;
                            console.log(values);
                             joinQuest.listQuests(values);
                        } else if(JSON.parse(result).code == 999){
                            
                                $('<div class="notification">no quest is completed</div>').insertBefore($('.joinQuestContainer .allQuestsContainer'))
                            setTimeout(function () {
                                $('.joinQuestContainer .notification').remove()
                            }, 4000)
                        }

                    } else {

                        $('<div class="notification">Oops! fail to save your quest, please try again</div>').insertBefore($('.joinQuestContainer .allQuestsContainer'))
                        setTimeout(function () {
                            $('.joinQuestContainer .notification').remove()
                        }, 4000)
                    }
                }
            }
            request.send(data);
    
 /***************************page change**********************************/
         $('[data-role="page"]').removeClass('show');
        $('[data-role="page"]').addClass('hide');
         
        $('#joinQuestPage').removeClass('hide');
        $('#joinQuestPage').addClass('show');
        
      
 /***************************page change**********************************/


    },
    listQuests:function(values){
      
        console.log(values.length);
        if($('.allQuestsContainer .questsList')){
            $('.allQuestsContainer .questsList').remove();
        }
        $('.allQuestsContainer').append('<ul class="questsList"></ul>')
        for(var i=0; i<values.length;i++){
           var quest_name=values[i].quest_name;
            var quest_id= values[i].quest_id;
            var user_id= values[i].user_id;
            $('.questsList').append('<li data-questId="'+quest_id+'" data-userId="'+user_id+'">'+quest_name+'</li>');
        }
         
            $('.questsList li').bind('click', lite.checkOldStatus);
        lite.checkSavequest();
    },
    
    getServerLocations:function(quest_id){
        var uri= "http://m.edumedia.ca/wu000155/geo/get-locations.php";

        var data = new FormData();
            data.append('quest_id', quest_id);
            var request = new XMLHttpRequest();
            request.open('POST', uri, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 || request.readyState == "complete") {
                    if (request.status === 200 || request.status === 0) {
                        var result = request.responseText;
                        console.log(result);
                        console.log(JSON.parse(result));
                        
                        if (JSON.parse(result).code == 0) {
                             var values = JSON.parse(result).values;
                            console.log(values);
                            lite.downloadLocations(values);
                        }else{
                            alert('no location can be found');
                        }

                    } else {
                       $('<div class="notification">Oops! fail to get this location, please try again</div>').insertBefore($('.joinQuestContainer .allQuestsContainer'))
                        setTimeout(function () {
                            $('.joinQuestContainer .notification').remove()
                        }, 4000)
                    }
                }
            }
            request.send(data);
    },
    showLocationTrack: function(){
        if($('.joinLocationsContainer .notification')){
          $('.joinLocationsContainer .notification').remove()
        }
          /***************************page change**********************************/
        $('#joinQuestPage').removeClass('show');
        $('#joinQuestPage').addClass('hide');
        $('#joinLocationsPgae').removeClass('hide');
        $('#joinLocationsPgae').addClass('show');

 /***************************page change**********************************/
         var params = {
            enableHighAccuracy: false,
            timeout: 100000,
            maximumAge: 3000
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(joinQuest.gpssuccess, app.gpsError, params)
            goTimer = setInterval(function(){
            navigator.geolocation.getCurrentPosition(joinQuest.gpssuccess, app.gpsError, params);},10000)
            console.log("got geo?")
        } else {
            alert("geo not supported");
        }
    },
    gpssuccess:function(position ){
         var currentLat = position.coords.latitude;
        var currentLon = position.coords.longitude;
        var datalat= $('.hintInfo').attr('data-lat');
        var datalon= $('.hintInfo').attr('data-lon');
        console.log(currentLat);
        console.log(currentLon);
       var  myLatlng = new google.maps.LatLng(currentLat,currentLon);
        var dataLatlng=new google.maps.LatLng(datalat,datalon);
        var meters = Math.round (google.maps.geometry.spherical.computeDistanceBetween(myLatlng,dataLatlng)); 
        if(meters<50){
         console.log('you got it');
            joinQuest.showDialog(myLatlng);
        }
    },
    showDialog:function(myLatlng){

        $('[data-role="page"]').removeClass('show');
        $('[data-role="page"]').addClass('hide');
       $('#dialog').removeClass('hide');
        $('#joinLocationsPgae, .heading').addClass('blur');
        $('.mask').removeClass('hide');
        $('#joinLocationsPgae').removeClass('hide');
        $('#joinLocationsPgae').addClass('show');
         var options = {
            zoom: 15,
            center: myLatlng,
            mapTypeControl: false,

            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("resultMap"), options);

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: "You are here!"
        });
         clearInterval(goTimer);
         goTimer = null;
    },
    nextGame:function(){
      
        lite.checkStatus();
        $('#dialog').addClass('hide');
        $('#joinLocationsPgae, .heading').removeClass('blur');
        $('.mask').addClass('hide');
        lite.showLocation();
    },
    showFinishedinfo :function(){
        console.log('showFinishedinfo');
		if($('.joinLocationsContainer .notification')){
          $('.joinLocationsContainer .notification').remove()
        }
          $('.joinLocationsContainer').append('<div class="notification congrats"><h1>Congratulations</h1><h2>Quest Complete!</h2><div data-role="btn" class="questCompete">OK</div></div>');
        
          FastClick.attach(document.querySelector('.questCompete'));
           $(".questCompete").bind("click", app.welcomepages);
    }
}