using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Utils;

namespace KkkMonitoring.Models.Models
{
    public class ParameterMonitoring : DbContext
    {
        private int delay = 5000;
        private bool shouldWork = false;
        private Task monitorTask;

        #region Реализация Singleton
        private static readonly Lazy<ParameterMonitoring> lazyInit = 
            new Lazy<ParameterMonitoring>(() => new ParameterMonitoring());



        private ParameterMonitoring() : base("ConnStr")
        {
        }

        ~ParameterMonitoring()
        {
            StopMonitor();
        }

        public async Task StartMonitor()
        {
            shouldWork = true;

            while (shouldWork)
            {
                monitorTask = Task.Run(() =>
                {
                    Monitor();
                });
                Console.WriteLine(DateTime.Now.ToString() + " hey!");
                await Task.Delay(delay);
                monitorTask.Wait();
            }
        }

        public void StopMonitor()
        {
            shouldWork = false;
            monitorTask.Wait();
        }

        public static ParameterMonitoring GetMonitorInstance => lazyInit.Value;
        #endregion

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            modelBuilder.Configurations.Add(new ParameterValue.ParameterValueConfiguration());
            base.OnModelCreating(modelBuilder);
        }

        private interface IMonitoringValue
        {
            Guid? ElementId { get; set; }
            bool IsUpdated { get; }
            Guid ParamId { get; set; }
            Guid StationId { get; set; }
            string Value { get; set; }
        }

        private class MonitoringValue<T> : IMonitoringValue
        {
            private T previousValue;
            private T curValue;
            //Относительная разница, с которого считаем, что значение параметра изменилось
            private readonly double updateLimit = 0.1;

            public Guid StationId { get; set; }
            public Guid? ElementId { get; set; }
            public Guid ParamId { get; set; }

            public string Value
            {
                get { return curValue?.ToString(); }
                set
                {
                    previousValue = curValue;
                    curValue = (T) TypesHelper.CastToType(value, typeof(T));
                }
            }

            public bool IsUpdated
            {
                get
                {
                    double curVal;
                    if (TypesHelper.TryCastToNumber(curValue, typeof(T), out curVal))
                    {
                        double prevVal;
                        TypesHelper.TryCastToNumber(previousValue, typeof(T), out prevVal);
                        return Math.Abs(prevVal - curVal)/prevVal > updateLimit;
                    }
                    else
                    {
                        return previousValue?.ToString() != curValue?.ToString();
                    }
                }
            }
        }

        public DbSet<ParameterValue> Values { get; set; }

        public delegate void ParameterChangeHandler(string stationId, string elementId, string paramId, string value);
        public event ParameterChangeHandler OnParameterChange;

        private static List<IMonitoringValue> trackingParams = new List<IMonitoringValue>();

        private void Monitor()
        {
            var paramsToMonitor = trackingParams.Select(x => x.ParamId).ToArray();
            var parameters = Values.Where(x => paramsToMonitor.Contains(x.ParameterId)).AsNoTracking().ToList();
            foreach (var parameter in parameters)
            {
                var trackParam = trackingParams.First(x => x.ParamId == parameter.ParameterId);
                trackParam.Value = parameter.Value;
                if (trackParam.IsUpdated)
                {
                        OnParameterChange(
                            trackParam.StationId.ToString(), 
                            trackParam.ElementId?.ToString(),
                            trackParam.ParamId.ToString(), 
                            trackParam.Value);
                }
            }
        }

        public void AddStation(string stationId)
        {
            Guid stationGuid = Guid.Parse(stationId);
            if (trackingParams.FirstOrDefault(x => x.StationId == stationGuid) == null)
            {
                var stationParams =
                    Values.Include(x => x.Setting)
                        .Include(x => x.Station)
                        .Where(x => x.Station.StationId == stationGuid)
                        .ToArray();
                foreach (var stationParam in stationParams)
                {
                    var type = stationParam.GetCsType;
                    //Создаем generic с типом, который указан в БД (typescript сосёт)
                    Type monValWithType = typeof(MonitoringValue<>).MakeGenericType(type);
                    //Создаем сам объект (снова typescript сосёт)
                    var monVal = (IMonitoringValue) Activator.CreateInstance(monValWithType);
                    monVal.StationId = stationParam.Station.StationId;
                    monVal.ParamId = stationParam.ParameterId;
                    monVal.Value = stationParam.Value;
                    //TODO: добавить типовой элемент
                    trackingParams.Add(monVal);
                }
            }

            if (trackingParams.Count != 0 && !shouldWork)
            {
                StartMonitor();
            }
        }

        public void AddStation(Station station)
        {
            //КакойУжас: guid -> string -> guid
            AddStation(station.StationId.ToString());
        }

        public void RemoveStation(string stationId)
        {
            Guid stationGuid = Guid.Parse(stationId);

            var stationParams =
                Values.Where(x => x.Station.StationId == stationGuid).Select(x => x.ParameterId);
            trackingParams.RemoveAll(x => stationParams.Contains(x.StationId));

            if (trackingParams.Count == 0)
            {
                StopMonitor();
            }
        }

        public void RemoveStation(Station station)
        {
            RemoveStation(station.StationId.ToString());
        }
    }
}