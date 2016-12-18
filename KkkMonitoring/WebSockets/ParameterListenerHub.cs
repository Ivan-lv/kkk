using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Helpers;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using WebGrease.Css.Extensions;

namespace KkkMonitoring
{
    public interface IClient
    {
        void GetParameter(string stationId, string elementId, string paramId, string value);
    }

    [Authorize]
    [HubName("ParameterListenerHub")]
    public class ParameterListenerHub : Hub<IClient>
    {
        //HashSet запасен на будущее
        static Dictionary<string, HashSet<string>> usersStations = new Dictionary<string, HashSet<string>>();

        private class OperationResult
        {
            public OperationResult(bool isSuccess)
            {
                this.Success = isSuccess;
            }

            public OperationResult(Exception ex)
            {
                this.Success = false;
                this.ErrorReason = ex.Message;
            }

            public string Serialize()
            {
                return JsonConvert.SerializeObject(this);
            }

            [JsonProperty(PropertyName = "success")]
            public bool Success { get; set; }

            [JsonProperty(PropertyName = "errorReason")]
            public string ErrorReason { get; set; }
        }

        ParameterMonitoring monitor = ParameterMonitoring.GetMonitorInstance;
        public ParameterListenerHub()
        {
            monitor.OnParameterChange += MonitorOnOnParameterChange;
        }

        private void MonitorOnOnParameterChange(string stationId, string elementId, string paramId, string value)
        {
            var usersIds = usersStations[stationId];
            foreach (var userId in usersIds)
            {
                Clients.User(userId).GetParameter(stationId, elementId, paramId, value);
            }
        }

        [HubMethodName("SubscribeOnStation")]
        public string SubscribeOnStation(string stationId)
        {
            var userId = Context.Request.User.Identity.Name;

            try
            {
                monitor.AddStation(stationId);
                if(!usersStations.ContainsKey(stationId))
                {
                    usersStations.Add(stationId, new HashSet<string>());
                }
                usersStations[stationId].Add(userId);
            }
            catch (Exception ex)
            {
                return new OperationResult(ex).Serialize();
            }

            return new OperationResult(true).Serialize();
        }

        [HubMethodName("UnsubscribeFromStation")]
        public void UnsubscribeFromStation(string stationId)
        {
            var userId = Context.Request.User.Identity.Name;
            usersStations[stationId].Remove(userId);
        }

        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
        {
            return base.OnDisconnected(stopCalled);
            var userId = Context.Request.User.Identity.Name;
            usersStations.ForEach(x =>
            {
                if (x.Value.Contains(userId))
                {
                    x.Value.Remove(userId);
                }
            });

            return base.OnDisconnected(stopCalled);
        }
    }
}