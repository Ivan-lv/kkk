using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Mvc;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Models;

namespace KkkMonitoring.Controllers
{
    public class ElementsController : Controller
    {
        public ActionResult Elements()
        {
            return View();
        }
    }
}