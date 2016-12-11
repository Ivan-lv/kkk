using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Models;
using Newtonsoft.Json;
using WebGrease.Css.Extensions;

namespace KkkMonitoring.Controllers
{
    [Authorize]
    public class StationsController : Controller
    {
        // GET: Stations
        public ActionResult Index()
        {
            StationModel model = new StationModel();

            var stations = model.Stations.ToList().Select(x => new
            {
                Primarykey = x.StationId.ToString("D"),
                Name = x.Name,
                Coordinates = $"{Math.Round(x.Longitude, 2)}°, {Math.Round(x.Latitude, 2)}°",
            }).ToArray();

            var jsonString = JsonConvert.SerializeObject(stations);
            View("StationList").ViewData["Stations"] = jsonString;
            return View("StationList");
        }

        public ActionResult Create()
        {
            return View("StationCreateEdit");
        }

        [HttpPost]
        public string CreateEdit(string primarykey, string name, decimal? longitude, decimal? latitude, string parametersJson)
        {
            Tuple<string, string, string>[] parameters =
                JsonConvert.DeserializeObject<Tuple<string, string, string>[]>(parametersJson);

            Tuple<Guid?, ParameterSetting.ParameterType, string>[] parametersToDb = parameters.Select(x =>
            {
                Guid? guid = x.Item1 != null ? (Guid?)Guid.Parse(x.Item1) : null;
                var type = (ParameterSetting.ParameterType)Enum.Parse(typeof(ParameterSetting.ParameterType), x.Item2);
                return new Tuple<Guid?, ParameterSetting.ParameterType, string>(guid, type, x.Item3);
            }).ToArray();

            StationModel model = new StationModel();
            model.CreateEditStation(primarykey, name, longitude.Value, latitude.Value, parametersToDb);

            //Возвращаем true, т.к. jquery ajax сваливается в success/error по ответу, а не по статусу
            return JsonConvert.True;
        }

        public ActionResult Edit(string id)
        {
            StationModel model = new StationModel();
            Station station = model.LoadFullById(id);

            var viewData = new
            {
                id = station.StationId,
                name = station.Name,
                latitude = station.Latitude,
                longitude = station.Longitude,
                parameters = station.Parameters.Select(x => new {id = x.ParameterId.ToString(), name = x.Setting.Name, type = x.Setting.DataType.ToString()}),
            };
            
            var view = View("StationCreateEdit");
            view.ViewData["Station"] = JsonConvert.SerializeObject(viewData);

            return view;
        }

        [HttpPost]
        public string GetStations()
        {
            StationModel model = new StationModel();
            var stationsToMap = model.Stations.ToArray().Select(x => new
            {
                id = x.StationId,
                text = x.Name,
                latitude = x.Latitude,
                longitude = x.Longitude,
                state = (new Random().Next() % 2 == 0) ? "STOPPED" : "STARTED" //TODO: убрать иммитацию
            }).ToArray();
            var jsonStations = JsonConvert.SerializeObject(stationsToMap);

            return jsonStations;
        }

        [HttpGet]
        public string GetStationStructure(string id)
        {
            StationModel model = new StationModel();
            Guid guid = Guid.Parse(id);

            var stationStructure = model.Stations.Where(x => x.StationId == guid).Select(x => new
            {
                parameters = x.Parameters.Select(param => new
                {
                    param.Setting.Name,
                    param.Setting.DataType,
                    param.ParameterId
                }),
                //TODO: добавить параметры типовых элементов установки
            }).First();

            var structForJson = new
            {
                parameters = stationStructure.parameters.Select(x => new
                {
                    datatype = x.DataType.ToString(),
                    name = x.Name,
                    parameterId = x.ParameterId
                })
            };
            

            return JsonConvert.SerializeObject(structForJson);
        }
    }
}