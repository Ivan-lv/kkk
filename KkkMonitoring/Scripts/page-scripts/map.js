(function($) {

    $(function () {
        API.getStationsFastList().done(function(response) {
            /*init sidebar*/
            Sidebar.setTreeDatasource(response);

            /*init map*/
            OLMap.initMap({ target: "Map", stations: response });
        });

        

    });

})(jQuery);