var myQuest={
    myQuestPage:function(){
         console.log("myQuestPage");
         if($('.myQuests .myQuestsList')){
            $('.myQuests .myQuestsList').remove();
        }
        var uri= "http://m.edumedia.ca/wu000155/geo/my-quests.php";
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
                             myQuest.listMyQuests(values);
                        } else if(JSON.parse(result).code == 999){
                            
                                $('<div class="notification">you have no quest is incompleted</div>').insertBefore($('#myQuestPage .myQuests'))
                            setTimeout(function () {
                                $('#myQuestPage .notification').remove()
                            }, 4000)
                        }

                    } else {

                        $('<div class="notification">Oops! fail to save your quest, please try again</div>').insertBefore($('#myQuestPage .myQuests'))
                        setTimeout(function () {
                            $('#myQuestPage .notification').remove()
                        }, 4000)
                    }
                }
            }
            request.send(data);
    
 /***************************page change**********************************/
        $('#welcomepages').removeClass('show');
        $('#welcomepages').addClass('hide');
        $('#myQuestPage').removeClass('hide');
        $('#myQuestPage').addClass('show');
 /***************************page change**********************************/
   },
    listMyQuests:function(values){
        console.log(values.length);
        
        $('.myQuests').append('<ul class="myQuestsList"></ul>')
        for(var i=0; i<values.length;i++){
           var quest_name=values[i].quest_name;
            var quest_id= values[i].quest_id;
            var user_id= values[i].user_id;
            $('.myQuestsList').append('<li data-questId="'+quest_id+'" data-userId="'+user_id+'">'+quest_name+'</li>');
        }
        $('.myQuestsList li').bind('click', lite.checkmyquestLocations)
    },
    
}