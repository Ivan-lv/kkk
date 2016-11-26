using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.UI.WebControls;
using KkkMonitoring.Models.Entities;

namespace KkkMonitoring.Models.Models
{
    public class StationModel : DbContext
    {
        public StationModel() : base("ConnStr")
        {
            
        }

        public DbSet<Station> Stations { get; set; }

        public void CreateStation(string name, decimal longitude, decimal latitude, Tuple<ParameterSetting.ParameterType, string>[] parameters)
        {
            //TODO: сделать валидацию аргументов
            Entities.Station station = new Entities.Station()
            {
                Name = name,
                Latitude = latitude,
                Longitude = longitude
            };

            station.Parameters = parameters.Select(param =>
            {
                var dataType = param.Item1;
                var paramName = param.Item2;

                return new ParameterValue()
                {
                    Setting = new ParameterSetting() { DataType = dataType, Name = paramName },
                    Value = null,
                };
            }).ToArray();

            Stations.Add(station);
            this.SaveChanges();
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            modelBuilder.Configurations.Add(new ParameterValue.ParameterValueConfiguration());
            base.OnModelCreating(modelBuilder);
        }
    }
}