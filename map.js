function refreshTeamLocalization(){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "http://localhost:3000/territories/get",
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        var teams = _.groupBy(response,'team' );
        $('#territories').empty();

        $.each(teams, function (teamname, territories){
            $('#territories').append('<h4>' + teamname + '</h4>');
            $.each(territories, function (id, territory){
                $('#territories').append(territory.display + ' ' + territory.count + '<br />');
            });
        });

    });

    setTimeout(refreshTeamLocalization, 10 * 1000);
}