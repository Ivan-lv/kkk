using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using Model.Entities;
using Model.Models;

namespace ParameterWriter
{
    public class ParameterWriter : IParameterWriter
    {
        public List<StationDescription> GetStationDesctiption(string name, string id)
        {
            StationModel model = new StationModel();
            List<Station> stations = new List<Station>();

            List<StationDescription> stationDescriptions = new List<StationDescription>();

            if (!string.IsNullOrEmpty(id))
            {
                stations.Add(model.LoadFullById(id));
            }
            else if (!string.IsNullOrEmpty(name))
            {
                stations.AddRange(model.LoadFullByName(name));
            }
            else
            {
                throw new Exception("Не указано имя вышки и его идентификатор");
            }

            foreach (var station in stations)
            {
                var parameters = station.Parameters.Select(x => new ParameterDescription()
                {
                    DataType = x.Setting.DataType.ToString(),
                    Id = x.ParameterId.ToString(),
                    Name = x.Setting.Name,
                    Comment = x.Setting.Comment
                }).ToArray();
                var stationDescr = new StationDescription()
                {
                    Id = station.Name,
                    Name = station.Name,
                    parameters = parameters
                };
                stationDescriptions.Add(stationDescr);
            }

            return stationDescriptions;
        }

        public void WriteParameters(ParamValue[] missing_name)
        {
            
        }
    }
}
