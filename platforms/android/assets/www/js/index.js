var sequence;

var app = {

    // Application Constructor
    initialize: function () {
        this.bindEvents();


    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        var allBtn = document.querySelectorAll('[data-role="btn"]');
        for (var i = 0; i < allBtn.length; i++) {
            FastClick.attach(allBtn[i]);
        }

        $("#createQuest").bind("click", app.createQuestPage);
        $("#joinQuest").bind("click", joinQuest.joinQuestPage);
        $("#myQuest").bind("click", myQuest.myQuestPage);
        $("#registerbtn").bind("click", app.login);
        $(".back").bind("click", app.welcomepages);
        $("#nextQuest2ndPage").bind("click", app.saveQuest);
        $('#getGps').bind('click', app.getGeo);
        $('#nextQuestPage2').bind('click', app.nextLocation);
        $('#locationSubmit').bind("click", app.submitLocations);
        $('#nextLocation').bind('click', joinQuest.nextGame);
        $(".joinBack").bind("click", app.welcomepages);


        document.addEventListener("offline", app.networkfail, false);




    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        app.receivedEvent('deviceready');

        lite.checkliteDB();
    },
    // Update DOM on a Received Event
    receivedEvent: function (id) {

        console.log('Received Event: ' + id);


        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';
        if (states[networkState] != 'No network connection') {
            if (localStorage) {
                var userName = localStorage.getItem('username');
                console.log(userName);
                if (userName === null) {
                    app.showloginPage();
                } else {
                    app.welcomepages();

                }
            }


        }

    },

    showloginPage: function () {

    },
    login: function (ev) {

        ev.preventDefault();
        var fakeUUID = device.uuid;
        var userName = $("#username").val();
        var uri = "http://m.edumedia.ca/wu000155/geo/register-user.php";

        var notification = document.querySelector('#loginPage .notification');
        if (notification) {
            $('#loginPage .notification').remove();
        }

        if (userName != '') {
            var data = new FormData();
            data.append('user_name', userName);
            data.append('UUID', fakeUUID);
            var request = new XMLHttpRequest();
            request.open('POST', uri, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 || request.readyState == "complete") {
                    if (request.status === 200 || request.status === 0) {
                        var result = request.responseText;
                        JSON.parse(result).user_id
                        console.log(JSON.parse(result).user_id);
                        if (JSON.parse(result).user_id != null) {
                            app.registrationsuccess(result);
                        } else {
                            // alert('same user name');
                            $('.loginPageSocial').append('<div class="notification">same user name</div>');
                            setTimeout(function () {
                                $('.loginPageSocial .notification').remove()
                            }, 4000)
                        }
                    } else {
                        $('.loginPageSocial').append('<div class="notification">Oops! fail to register your account, please try again</div>');
                        setTimeout(function () {
                            $('.loginPageSocial .notification').remove()
                        }, 4000)
                    }
                }
            }
            request.send(data);
        } else {
            $('<div class="notification">User name can not be empty</div>').insertBefore($('#loginPage .loginPageSocial'))
            setTimeout(function () {
                $('.loginPageSocial .notification').remove()
            }, 4000)
        }
    },
    registrationsuccess: function (result) {
        var callback = JSON.parse(result)
        console.log(callback.user_id);
        var userName = $("#username").val();
        console.log(userName);
        localStorage.setItem('username', userName);
        localStorage.setItem('user_id', callback.user_id);
        app.welcomepages();
    },

    welcomepages: function () {
        console.log("welcomepages");

        var userName = localStorage.getItem('username');
        $(".loginUsername").html("Welcome: " + userName);
        /***************************page change**********************************/
        $('[data-role="page"]').removeClass('show');
        $('[data-role="page"]').addClass('hide');
        $('#welcomepages').removeClass('hide');
        $('#welcomepages').addClass('show');

        clearInterval(goTimer);
        goTimer = null;
        $("#questName").val("");
        $('#locationContainer').attr('data-sequence', '');
    },

    createQuestPage: function () {

        console.log("createQuestPage");

        $('[data-role="page"]').removeClass('show');
        $('[data-role="page"]').addClass('hide');
        $('#createQuestPage').removeClass('hide');
        $('#createQuestPage').addClass('show');

    },
    saveQuest: function (ev) {
        ev.preventDefault();
        var user_id = localStorage.getItem("user_id");
        console.log(user_id);
        var quest_name = $("#questName").val();
        console.log(quest_name);
        var isCompleted = "false";
        var uri = "http://m.edumedia.ca/wu000155/geo/create-quest.php";

        var notification = document.querySelector('#createContainer .notification');
        if (notification) {
            $('#createContainer .notification').remove();
        }

        if (user_id != '' && quest_name != '') {
            var data = new FormData();
            data.append('user_id', user_id);
            data.append('quest_name', quest_name);
            data.append('isCompleted', isCompleted);

            var request = new XMLHttpRequest();
            request.open('POST', uri, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 || request.readyState == "complete") {
                    if (request.status === 200 || request.status === 0) {
                        var result = request.responseText;
                        console.log(result);
                        console.log(JSON.parse(result).quest_id);
                        if (JSON.parse(result).quest_id != null) {
                            var quest_id = JSON.parse(result).quest_id;
                            console.log(JSON.parse(result).quest_id);
                            $("#questName").val("");
                            app.createQuestMapPage(quest_id);
                        } else {
                            //alert('same quest name');
                            $('<div class="notification">Quest name taken</div>').insertBefore($('#createContainer .createQuestForm'))
                            setTimeout(function () {
                                $('#createContainer .notification').remove()
                            }, 4000)
                        }

                    } else {
                        $('<div class="notification">Oops! fail to save your quest, please try again</div>').insertBefore($('#createContainer .createQuestForm'))
                        setTimeout(function () {
                            $('#createContainer .notification').remove()
                        }, 4000)
                    }
                }
            }
            request.send(data);
        } else {
            $('<div class="notification">quest name can not be empty</div>').insertBefore($('#createContainer .createQuestForm'))
            setTimeout(function () {
                $('#createContainer .notification').remove()
            }, 4000)
        }


    },



    createQuestMapPage: function (quest_id) {

        console.log("createQuestMapPage");
        $('#createQuestPage').removeClass('show');
        $('#createQuestPage').addClass('hide');
        $('#createQuestMapPage').removeClass('hide');
        $('#createQuestMapPage').addClass('show');
        /***************************page change**********************************/
        $('#locationContainer').attr('data-GEOQuest-id', quest_id);

        if ($('#locationContainer').attr('data-sequence') == "") {
            sequence = 0;
            console.log(sequence);
            //has issue
            $('#locationContainer').attr('data-sequence', sequence);

        } else {
            if ($('#locationContainer .information')) {
                $('#locationContainer .information').remove();
            }
            sequence = Number($('#locationContainer').attr('data-sequence'));
            console.log(sequence);
            var pages = sequence + 1
            $('<div class="information">Enter location ' + pages + ' </div>').insertBefore($('#locationContainer #getGps'))
            $('#locationContainer').attr('data-sequence', '');
        }

    },
    nextLocation: function (ev) {

        ev.preventDefault();


        lite.saveLocations();
    },
    submitLocations: function () {
        console.log('submitLocations');
        var hint = $.trim($("textarea").val());
        var lat = $('#mapcontainer').attr('data-lat');
        if (hint == "" && !lat) {
            lite.submitToDatabase();
        } else if (hint != '' && (lat && lat != '')) {
            $('#createQuestMapPage').removeClass('show');
            $('#createQuestMapPage').addClass('hide');
            $('#welcomepages').removeClass('hide');
            $('#welcomepages').addClass('show');
            lite.saveLocations();

            setTimeout(function () {
                lite.submitToDatabase();
            }, 1000)
        } else {
            alert('you did not finished your quest');
            /***************************want more good ux, add code here**********************************/
        }
    },

    getGeo: function () {
        if ($('#mapcontainer')) {
            $('#mapcontainer').remove();
        }
        $('<div id="mapcontainer" data-lat="" data-lon=""></div>').insertAfter($('#locationContainer #getGps'))
        console.log("made it to geolocation");
        var params = {
            enableHighAccuracy: false,
            timeout: 100000,
            maximumAge: 3000
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(app.success, app.gpsError, params);
            console.log("got geo?")
        } else {
            alert("geo not supported");
        }

    },

    success: function (position) {
        console.log("made it to success");
        var coordinate = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        var lat = position.coords.latitude;
        var longitude = position.coords.longitude;
        $('#mapcontainer').attr('data-lat', lat);
        $('#mapcontainer').attr('data-lon', longitude);
        console.log("latitude: " + lat + "longitude: " + longitude);

        var options = {
            zoom: 15,
            center: coordinate,
            mapTypeControl: false,

            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("mapcontainer"), options);

        var marker = new google.maps.Marker({
            position: coordinate,
            map: map,
            title: "You are here!"
        });
    },

    saveLocationstoDatabase: function (rs) {
        console.log("saveLocationstoDatabase");
        var literesult = rs.rows;
        var uri = "http://m.edumedia.ca/wu000155/geo/create-locations.php";

        console.log(literesult.length);
        if (literesult.length > 0) {
            for (var i = 0; i < literesult.length; i++) {
                var quest_id = rs.rows.item(i).quest_id;
                console.log(quest_id);
                var sqlSequence = rs.rows.item(i).sequence;
                console.log(sqlSequence);
                var hint = rs.rows.item(i).hint;
                console.log(hint);
                var GPS = rs.rows.item(i).GPS;
                console.log(GPS);
                var user_id = rs.rows.item(i).user_id;
                console.log(user_id);


                var data = new FormData();
                data.append('user_id', user_id);
                data.append('sequence', sqlSequence);
                data.append('hint', hint);
                data.append('GPS', GPS);
                data.append('quest_id', quest_id);

                var request = new XMLHttpRequest();
                request.open('POST', uri, true);
                request.onreadystatechange = function () {
                    if (request.readyState === 4 || request.readyState == "complete") {
                        if (request.status === 200 || request.status === 0) {
                            var result = request.responseText;

                            console.log(JSON.parse(result).values.length);
                            console.log(literesult.length);

                        } else {

                            $('<div class="notification">Oops! fail to save your quest, please try again</div>').insertBefore($('#locationContainer #locationHintArea'))
                            setTimeout(function () {
                                $('#locationContainer .notification').remove()
                            }, 4000)
                        }
                    }
                }
                request.send(data);

            }
            app.changeStatus(quest_id);
        } else {
            $('<div class="notification">you did not save any location for this quest</div>').insertBefore($('#locationContainer #locationHintArea'))
            setTimeout(function () {
                $('#locationContainer .notification').remove()
            }, 4000)
        }
    },
    changeStatus: function (quest_id) {
        var uri = "http://m.edumedia.ca/wu000155/geo/change-status.php";
        var data = new FormData();
        data.append('quest_id', quest_id);
        var request = new XMLHttpRequest();
        request.open('POST', uri, true);
        request.onreadystatechange = function () {
            if (request.readyState === 4 || request.readyState == "complete") {
                if (request.status === 200 || request.status === 0) {
                    var result = request.responseText;
                    console.log(result);


                }
            }
        }
        request.send(data);
    },

    gpsError: function (error) {
        alert("gps error no code provided")
        var errors = {
            1: 'Permission denied',
            2: 'Position unavailable',
            3: 'Request timeout'
        };
        alert("Error: " + errors[error.code]);
    },
    networkfail: function () {
        alert("Check your internet please!");
    },


};

app.initialize();