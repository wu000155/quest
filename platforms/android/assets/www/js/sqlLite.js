var db = null;
var liteSequence;
var lite = {
    checkliteDB: function () {

        //app start once deviceready occurs
        console.info("deviceready");
        db = openDatabase('questTestDatabaseV4', '', 'Sample DB', 800 * 800);
        if (db.version == '') {
            console.info('First time running... create tables');
            //means first time creation of DB
            //increment the version and create the tables
            db.changeVersion('', '1.0',
                function (trans) {
                    //something to do in addition to incrementing the value
                    //otherwise your new version will be an empty DB
                    //console.info("DB version incremented");
                    //do the initial setup               
                    trans.executeSql('CREATE TABLE IF NOT EXISTS locations(quest_id INTEGER, sequence INTEGER, hint TEXT, GPS TEXT, user_id INTEGER)', [],
                        function (tx, rs) {
                            //do something if it works
                            console.info("locations Table locations created");
                        },
                        function (tx, err) {
                            //failed to run query
                            console.info(err.message);
                        });
                    trans.executeSql('CREATE TABLE IF NOT EXISTS seqStatus(quest_id INTEGER, status INTEGER)', [],
                        function (tx, rs) {
                            //do something if it works
                            console.info("status Table locations created");
                        },
                        function (tx, err) {
                            //failed to run query
                            console.info(err.message);
                        });

                },
                function (err) {
                    //error in changing version
                    //if the increment fails
                    console.info(err.message);
                },
                function () {
                    //successfully completed the transaction of incrementing the version number   
                    console.info("change Version success");
                });

        } else {
            //version should be 1.0
            //this won't be the first time running the app
            console.info('Version: ', db.version)

        }
    },
    saveLocations: function () {
        console.log("get here");
        var hint = $.trim($("textarea").val());
        console.log(hint);
        var user_id = localStorage.getItem("user_id");
        var quest_id = $('#locationContainer').attr('data-GEOQuest-id');
        var lat = $('#mapcontainer').attr('data-lat');
        var lon = $('#mapcontainer').attr('data-lon');
        var GPS = lat + "|" + lon;
        console.log(lat + " : " + lon);
        if (lat) {
            if (hint != "" && lat != "") {
                sequence++;
                console.log(sequence);
                db.transaction(function (trans) {
                    trans.executeSql('INSERT INTO locations(quest_id, sequence, hint, GPS, user_id) VALUES(?,?,?,?,?)', [quest_id, sequence, hint, GPS, user_id],
                        function (tx, rs) {
                            if ($('#locationContainer .information')) {
                                $('#locationContainer .information').remove();
                            }
                            $('#locationContainer').attr('data-sequence',sequence);
                            console.info("locations have been inserted");
                            $('#mapcontainer').attr('data-lat', '');
                            $('#mapcontainer').attr('data-lon', '');
                            $("textarea").val('');
                            $('#mapcontainer').remove();
                        
                            var pages = sequence + 1
                            $('<div class="information">Enter Location ' + pages + ' location</div>').insertBefore($('#locationContainer #getGps'))
                            /****************add transition class again to fake page change******good choice************/

                        },
                        function (tx, err) {
                            //failed to run the query
                            console.info(err.message);
                        });

                }, lite.transErr, lite.transSuccess);
            } else {
                $('<div class="notification">I think you forgot to leave your hint or geolocation</div>').insertBefore($('#locationContainer #locationHintArea'))
                setTimeout(function () {
                    $('#locationContainer .notification').remove()
                }, 4000)
            }
        } else {
            $('<div class="notification">I think you forgot to leave your geolocation</div>').insertBefore($('#locationContainer #locationHintArea'))
            setTimeout(function () {
                $('#locationContainer .notification').remove()
            }, 4000)
        }
    },

    submitToDatabase: function () {
        var quest_id = $('#locationContainer').attr('data-GEOQuest-id');
        console.log('saveLocationstoDatabase');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM locations where quest_id=?', [quest_id],
                function (tx, rs) {
                    //success running the query
                    var result = rs.rows;
                    console.log(result);

                    app.saveLocationstoDatabase(rs);

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);
    },
    checkOldStatus: function () {
        var quest_id = $(this).attr('data-questId');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM seqStatus where quest_id=?', [quest_id],
                function (tx, rs) {
                    //success running the query
                    console.log(rs);
                    var result = rs.rows.length;
                    console.log(result);
                    if (result > 0) {
                        $('.joinLocationsContainer').attr('data-currentQuest', quest_id);
                        liteSequence = Number(rs.rows.item(0).status);
                        console.log(liteSequence);
                        lite.showLocation();
                    } else {

                        lite.checkLocations(quest_id);
                    }

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);
    },
    checkLocations: function (quest_id) {
        liteSequence = 0;
        $('.joinLocationsContainer').attr('data-currentQuest', quest_id);
        var user_id = localStorage.getItem('user_id');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM locations where quest_id=? AND user_id!=?', [quest_id, user_id],
                function (tx, rs) {
                    //success running the query
                    var result = rs.rows.length;
                    console.log(result);
                    if (result == 0) {
                        joinQuest.getServerLocations(quest_id);
                    } else {
                        //change page and show first location function
                        lite.showLocation();
                    }

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);

    },
    downloadLocations: function (values) {

        db.transaction(function (trans) {
            for (var i = 0; i < values.length; i++) {
                var user_id = values[i].user_id;
                var sqlSequence = values[i].sequence;
                var hint = values[i].hint;
                var GPS = values[i].GPS;
                var quest_id = values[i].quest_id;
                trans.executeSql('INSERT INTO locations(quest_id, sequence, hint, GPS, user_id) VALUES(?,?,?,?,?)', [quest_id, sqlSequence, hint, GPS, user_id],
                    function (tx, rs) {
                        //success running the query
                        console.info("download finished");

                    },
                    function (tx, err) {
                        //failed to run the query
                        console.info(err.message);
                    });
            }

        }, lite.transErr, lite.showLocation);

    },
    showLocation: function () {
        console.log('');
        liteSequence++
        console.log(liteSequence);
        if ($('.hintInfo')) {
            $('.hintInfo').remove();
        }
        var quest_id = $('.joinLocationsContainer').attr('data-currentQuest');
        console.log(quest_id);
        var user_id = localStorage.getItem('user_id');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM locations where quest_id=? AND user_id!=? AND sequence=?', [quest_id, user_id, liteSequence],
                function (tx, rs) {
                    //success running the query
                    var result = rs.rows.length;
                    console.log(result);
                    if (result > 0) {
                        $('.joinLocationsContainer').append('<p data-lat="" data-lon="" class="hintInfo"></p>')
                        var GPS = rs.rows.item(0).GPS;
                        var GPSArray = GPS.split('|');
                        var lat = GPSArray[0];
                        var lon = GPSArray[1];
                        $('.hintInfo').text(rs.rows.item(0).hint);
                        $('.hintInfo').attr('data-lat', lat);
                        $('.hintInfo').attr('data-lon', lon);
                        joinQuest.showLocationTrack();
                    } else {
                        //show finish whole quest info function
                        $('[data-role="page"]').removeClass('show');
                        $('[data-role="page"]').addClass('hide');
                        $('#joinLocationsPgae').removeClass('hide');
                        $('#joinLocationsPgae').addClass('show');
                        joinQuest.showFinishedinfo();
                    }
                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });

        }, lite.transErr, lite.transSuccess);
    },

    checkmyquestLocations: function () {

        var quest_id = $(this).attr('data-questId');
        var user_id = localStorage.getItem('user_id');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM locations where quest_id=? AND user_id=?', [quest_id, user_id],
                function (tx, rs) {
                    //success running the query
                    var result = rs.rows.length;
                    console.log(result);
					$('#myQuestPage').removeClass('show');
                  $('#myQuestPage').addClass('hide');
                    if (result > 0) {
                        
                        $('#locationContainer').attr('data-sequence', result);
                        
                    }else{
						  $('#locationContainer').attr('data-sequence', "0");
					  }
					
                  app.createQuestMapPage(quest_id);
                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);

    },
    checkStatus: function () {
        var quest_id = $('.joinLocationsContainer').attr('data-currentQuest');
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM seqStatus where quest_id=?', [quest_id],
                function (tx, rs) {
                    //success running the query
                    console.log(rs);
                    var result = rs.rows.length;

                    console.log(result);
                    if (result > 0) {

                        lite.updataStatus();
                    } else {

                        lite.insertStatus();
                    }

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);
    },
    insertStatus: function () {
        var quest_id = $('.joinLocationsContainer').attr('data-currentQuest');
        db.transaction(function (trans) {

            trans.executeSql('INSERT INTO seqStatus(quest_id, status) VALUES(?,?)', [quest_id, liteSequence],
                function (tx, rs) {
                    //success running the query
                    console.info("sava status success");

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);
    },
    updataStatus: function () {
        var quest_id = $('.joinLocationsContainer').attr('data-currentQuest');
        db.transaction(function (trans) {

            trans.executeSql("UPDATE seqStatus SET status= ? WHERE quest_id = ?", [liteSequence, quest_id],
                function (tx, rs) {
                    //success running the query
                    console.info("UPDATE status success");

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);

    },
    checkSavequest:function(){
        
        db.transaction(function (trans) {

            trans.executeSql('SELECT * FROM seqStatus', [],
                function (tx, rs) {
                    //success running the query
                    console.log(rs);
                    var result = rs.rows.length;

                    console.log(result);
                    if (result > 0) {

                        for(var i=0;i<result;i++){
                            var quest_id=rs.rows.item(i).quest_id;
                            if($('.questsList')){
                            $('.questsList > li[data-questId="'+quest_id+'"]').css('background-color','#329932')
                            $('.questsList > li[data-questId="'+quest_id+'"]').css('color','#FFFFFF')
                            $('.questsList > li[data-questId="'+quest_id+'"]').css('border', '1px solid #FFFDF1')
                            console.log($('.questsList > li[data-questId="'+quest_id+'"]'))
                            }
                        }
                    } 

                },
                function (tx, err) {
                    //failed to run the query
                    console.info(err.message);
                });


        }, lite.transErr, lite.transSuccess);
    },
    transErr: function (tx, err) {
        //a generic function to run when any transaction fails
        //navigator.notification.alert(message, alertCallback, [title], [buttonName])
        console.info("Error processing transaction: " + err);
    },

    transSuccess: function () {
        //a generic function to run when any transaction is completed
        //not something often done generically
        console.info("db transaction success");
    }
}