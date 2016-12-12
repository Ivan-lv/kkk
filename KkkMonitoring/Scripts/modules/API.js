; var API = (function ($) {

    function getStation(stationId) {
        return $.getJSON({
            url: "/Stations/GetStationStructure",
            data: {id: stationId}
        });
    }

    function getStationsFastList() {
        return $.ajax({
            url: "/Stations/GetStations",
            type: "post",
            dataType: "json"
        });
    }

    return {
        getStation: getStation,
        getStationsFastList: getStationsFastList
    }

})(jQuery);