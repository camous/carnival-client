var team;

function roundDomReady(){
    team = $('#team').val();
    var roundid = 1;

    loadObjectives(roundid, team, function(objectives){
        $.each(objectives, function (key, value){
            displayObjective(roundid, key, value);
        });
    });

    $('#round' + roundid + 'addobjective').click(function(event){
        newObjective(roundid);
    });

}

function loadDomTerritories(roundid, objectiveid){

    var baseid = '#round' + roundid + 'objective' + objectiveid;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/teams/get/" + team,
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        populateContinentTerritories(baseid + 'from', response);

        settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://localhost:3000/territories/get/",
            "method": "GET"
        }

        $.ajax(settings).done(function (response) {
            populateContinentTerritories(baseid + 'to', response);
        });

    });
}

function newObjective(roundid){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/objectives/" + roundid + "/" + team,
        "method": "PUT",
        "headers": {
          "content-type": "application/json"
        },
        "processData": false,
        "data": "{\"from\" : \"\",\"to\" : \"\",\"resource\" : 0,\"achievable\" : \"smile\",\"realistic\" : \"smile\",\"time\" : 0}"
      }

      $.ajax(settings).done(function (newobjective) {
        displayObjective(roundid, newobjective.objectiveid, newobjective.objective, this);
        loadDomTerritories(roundid, newobjective.objectiveid);
      });
}

function displayObjective(roundid, objectiveid, objective, caller){
    // we clone template line, replace text for IDs & fill if new item
    var domobjectiveid = 'round' + roundid + 'objective' + objectiveid;
    var domobjective;
    
    if($('#' + domobjectiveid).length){
        domobjective = $('#' + domobjectiveid);
    } else
    {
        domobjective = $('#objectivetemplate').clone().attr('id', domobjectiveid);

        // if caller isn't null (method calling displayObjective), we assume a pure new objective
        if(caller !== undefined){
            domobjective.addClass('objectivedirty');
            $('#' + domobjectiveid + 'edit').toggle();
            $('#' + domobjectiveid + 'save').toggle();
        }
        domobjective.html(domobjective.html().replace(/%domobjectiveid%/g, domobjectiveid));
        $('#round' + roundid+ 'objectives').append(domobjective);
    }

    selectOrInsertOption('#' + domobjectiveid + 'from',objective.from );
    $('#' + domobjectiveid + 'from').change(function(event){
        displayTerritoryRoute(domobjectiveid);
    });
    selectOrInsertOption('#' + domobjectiveid + 'to',objective.to );
    $('#' + domobjectiveid + 'to').change(function(event){
        displayTerritoryRoute(domobjectiveid);
    });

    selectOrInsertOption('#' + domobjectiveid + 'resourcecount',objective.resource );
    $('#' + domobjectiveid + 'time').val(objective.time);
    $('#' + domobjectiveid + 'id').html((objectiveid + 1).toString());

    // actions
    $('#' + domobjectiveid + 'delete').one('click',deleteDomObjective);
    $('#' + domobjectiveid + 'edit').one('click',editDomObjective);
    $('#' + domobjectiveid + 'save').one('click',saveDomObjective);

    displayTerritoryRoute(domobjectiveid);
}

// force reload territories & resource count
function saveDomObjective(event){
    var dom = getDomObjectives(event.toElement.id);
    
    var data = {
        from : $('#' + dom.baseid + 'from').val(),
        to : $('#' + dom.baseid + 'to').val(),
        resource : $('#' + dom.baseid + 'resourcecount').val(),
        time : $('#' + dom.baseid + 'time').val()
    };

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/objectives/" + dom.roundid + "/" + team + "/" + dom.objectiveid,
        "method": "PUT",
        "headers": {
          "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(data)
      }

      $.ajax(settings).done(function (updatedobjective) {
        displayObjective(dom.roundid, updatedobjective.objectiveid, updatedobjective.objective);
      });

    $('#' + dom.baseid + 'edit').toggle();
    $('#' + dom.baseid + 'save').toggle();
    $('#' + dom.baseid).removeClass('objectivedirty').addClass('objective');
}

// force reload territories & resource count
function editDomObjective(event){
    var dom = getDomObjectives(event.toElement.id);

    loadDomTerritories(dom.roundid, dom.objectiveid);

    $('#' + dom.baseid + 'edit').toggle();
    $('#' + dom.baseid + 'save').toggle();
    $('#' + dom.baseid).removeClass('objective').addClass('objectivedirty');
}

function emptyDomObjectives(roundid) {
    var domobjectives = $('#round' + roundid + 'objectives tr').slice(2);

    $.each(domobjectives, (trid) => {
        domobjectives[trid].remove();
    });
}

// erk
function getDomObjectives(id){
    var ids = /round([0-9]*)objective([0-9*])/.exec(id);
    var roundid = parseInt(ids[1]);
    var objectiveid = parseInt(ids[2]);

    return {roundid : roundid, objectiveid : objectiveid, baseid : 'round' + roundid + 'objective' + objectiveid};
}

function deleteDomObjective(event){
    var dom = getDomObjectives(event.toElement.id);

    var message = 'delete objective #' + (dom.objectiveid + 1).toString() + ' (round ' + dom.roundid + ')';
    if(confirm(message)) {
        deleteObjective(dom.roundid, dom.objectiveid);
    }
}

function deleteObjective(roundid, objectiveid){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/objectives/" + roundid + "/" + team + "/" + objectiveid,
        "method": "DELETE",
        "headers": {}
      }
      
      $.ajax(settings).done(function (objectives) {
        emptyDomObjectives(roundid);
        $.each(objectives, function (key, value){
            displayObjective(roundid, key, value);
        });
      });
}

function selectOrInsertOption(selectinput, value){
    if($(selectinput + ' option').length == 0){
        $(selectinput).append('<option>' + value + '</option')
    }
}

function populateContinentTerritories(selectinput,response,selected) {

    // default loading is done with only actual value (and not the full list,preventing display surprise cross round :))
    selected = selected || $(selectinput).val();

    $(selectinput).empty();
    // init with empty for triggering new group on first round
    var optcontinent = $('<optgroup label=""><option value="">select a territory</option></optgroup');

    $.each(response, function (key,value){
        if(optcontinent.attr('label') != value.continent){
            
            $(selectinput).append(optcontinent);
            optcontinent = $('<optgroup label="' + value.continent + '"></optgroup');
        }

        optcontinent.append('<option value="' + key + '" ' + (selected !== undefined && selected===key ? 'selected':'') + '>' + value.display + '</option>');
    });
}

function getTerritory(territory, callback){
    settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/territories/get/" + territory,
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        callback(response);
    });
}

function loadObjectives(roundid, team, callback){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/objectives/1/" + team,
        "method": "GET"
    }
    $.ajax(settings).done(function (response) {
        callback(response);
    });
}

function getTerrorityRoute(from, to, callback) {
    settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/routes/" + from + "/" + to,
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        callback(response);
    });
}

function displayTerritoryRoute(objectiveid){
    var route = "";
    var from = $('#' + objectiveid + 'from').val();
    var to = $('#' + objectiveid + 'to').val();
    
    if(from !== "" && to !== "") {
        getTerrorityRoute(from, to, function (data){
            route = JSON.stringify(data);
            
            var ul = $('<ul></ul>');
            
            $.each(data.territories, function (key,value){
                var display;
                if(value.count !== undefined){
                    display = value.display + ' / ' + value.team + '(' + value.count + ')';
                } else {
                    display = value.display;
                }
                ul.append('<ol>' + display + '</ol>');
            });
            
            $('#' + objectiveid + 'route').html(ul);
        });
    }
}