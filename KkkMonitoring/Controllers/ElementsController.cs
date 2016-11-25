using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Models;

namespace KkkMonitoring.Controllers
{
    public class ElementsController : ApiController
    {
        Model model = new Model();

        [HttpGet]
        public void CreateElement()
        {
            model.Elements.Add(new Element()
            {
                Latitude = 36,
            });
            model.SaveChanges();
        }
    }
}