var parameterSocket =
{
    hub : undefined,
    server: undefined,
    client: undefined,

    init : (function($) {
        debugger;
        this.hub = $.connection.ParameterListenerHub;
        this.server = hub.server;
        this.client = hub.client;
        $.connection.hub.start();
    })(jQuery),

    subscribe: function(stationId, callback) {
        server.SubscribeOnStation(stationId);
        client.GetParameter = callback;
    },

    unsubscribe: function(stationId) {
        server.UnsubscribeFromStation(stationId);
    }
}