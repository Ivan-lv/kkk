var parameterSocket =
{
    hub: undefined,
    server: undefined,
    client: undefined,
    currentStation: undefined,

    init: (function($) {
        debugger;
        this.hub = $.connection.ParameterListenerHub;
        this.server = hub.server;
        this.client = hub.client;

    })(jQuery),

    startListen: function(callback) {
        hub.client.getParameter = callback;
        $.connection.hub.start()
            .done(function () { console.log('SignalR connected with id' + $.connection.hub.id); })
            .fail(function () { console.log('Achtung!'); });
    },

    subscribe: function(stationId) {
        server.SubscribeOnStation(stationId);
        currentStation = stationId;
    },

    unsubscribe: function (stationId) {
        var id = stationId == undefined ? currentStation : stationId;
        server.UnsubscribeFromStation(id);
    }
}