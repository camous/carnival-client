function roundDomReady(){
    var team = $('#team').val();
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/teams/get/" + team,
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        populateContinentTerritories('#round1objective1from', response);
    });

    settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/territories/get/",
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        populateContinentTerritories('#round1objective1to', response);
    });
}

function populateContinentTerritories(selectinput,response,selected) {
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