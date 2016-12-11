(function($) {

    var data = [
        {
            "id": "583b3af2c6e8db86e4894e8a",
            "text": "скв - 100",
            "latitude": "12.181417",
            "longitude": "-55.326537",
            "state": "STARTED"
        },
        {
            "id": "583b3af25f8bb9a573eae7a1",
            "text": "скв - 123",
            "latitude": "57.99658416302816",
            "longitude": "56.24791468759818",
            "state": "STOPPED"
        },
        {
            "id": "583b3af2a412f68ca2eeff63",
            "text": "скв - 11",
            "latitude": "-42.593248",
            "longitude": "24.425409",
            "state": "STOPPED"
        },
        {
            "id": "583b3af234a0baa29b45456d",
            "text": "скв - 59",
            "latitude": "-19.366746",
            "longitude": "-86.418854",
            "state": "STARTED"
        },
        {
            "id": "583b3af2dc89a7bc928727ad",
            "text": "скв - 74",
            "latitude": "-89.876448",
            "longitude": "-58.636083",
            "state": "STOPPED"
        },
        {
            "id": "583b3af20422da575d40087f",
            "text": "скв - 1",
            "latitude": "-50.278219",
            "longitude": "33.1612",
            "state": "NOT_RESPONDING"
        }
    ];


    $(function () {
        $.ajax({
            url: "/Stations/GetStations",
            type: "post",
            dataType: "json"
        }).done(function(response) {
            /*init tree*/
            TreeViewModule.setDataSource(response);

            /*init map*/
            OLMap.initMap({ target: "Map", stations: response });
        });

        

    });

})(jQuery);