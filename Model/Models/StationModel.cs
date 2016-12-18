using System;
using System.Data.Entity;
using System.Linq;
using Model.Entities;

namespace Model.Models
{
    public class StationModel : DbContext
    {
        public StationModel() : base("ConnStr")
        {
            
        }

        public DbSet<Station> Stations { get; set; }

        public Station CreateStation(string name, decimal longitude, decimal latitude, Tuple<Guid?, ParameterSetting.ParameterType, string>[] parameters)
        {
            var station = new Station()
            {
                Name = name,
                Latitude = latitude,
                Longitude = longitude,
            };

            station.Parameters = parameters.Select(param =>
            {
                var dataType = param.Item2;
                var paramName = param.Item3;

                return new ParameterValue()
                {
                    Setting = new ParameterSetting() { DataType = dataType, Name = paramName },
                    Value = null,
                };
            }).ToArray();

            return station;
        }

        public Station EditStation(string primarykey, string name, decimal longitude, decimal latitude, Tuple<Guid?, ParameterSetting.ParameterType, string>[] parameters)
        {
            var guid = Guid.Parse(primarykey);
            var station = Stations.Include(x => x.Parameters.Select(y => y.Setting)).First(x => x.StationId == guid);

            station.Name = name;
            station.Latitude = latitude;
            station.Longitude = longitude;

            foreach (var parameter in parameters)
            {
                var id = parameter.Item1;
                if (id != null)
                {
                    var updateParam = station.Parameters.First(x => x.ParameterId == id);
                    updateParam.Setting.Name = parameter.Item3;
                    updateParam.Setting.DataType = parameter.Item2;
                }
                else
                {
                    var newParam = new ParameterValue()
                    {
                        Setting = new ParameterSetting() { DataType = parameter.Item2, Name = parameter.Item3 },
                        Value = null,
                    };
                    station.Parameters.Add(newParam);
                }
            }

            return station;
        }

        public void CreateEditStation(string primarykey, string name, decimal longitude, decimal latitude, Tuple<Guid?, ParameterSetting.ParameterType, string>[] parameters)
        {
            //TODO: сделать валидацию аргументов
            Station station;
            //Создание станции
            if (primarykey == null)
            {
                station = CreateStation(name, longitude, latitude, parameters);
                Stations.Add(station);
            }
            //Редактирование
            else
            {
                station = EditStation(primarykey, name, longitude, latitude, parameters);
            }

            this.SaveChanges();
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            modelBuilder.Configurations.Add(new ParameterValue.ParameterValueConfiguration());
            base.OnModelCreating(modelBuilder);
        }

        public Station LoadFullById(string id)
        {
            var guidKey = Guid.Parse(id);
            var station = Stations.Include(x => x.Parameters.Select(y => y.Setting)).First(x => x.StationId == guidKey);
            if (station == null)
            {
                throw new Exception("No such Station");
            }

            return station;
        }

        public Station[] LoadFullByName(string name)
        {
            var stations =
                Stations.Include(x => x.Parameters.Select(y => y.Setting)).Where(x => x.Name == name).ToArray();

            return stations;
        }
    }
}