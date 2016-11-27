using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KkkMonitoring.Controllers
{
    [Authorize]
    public class StationsController : Controller
    {
        // GET: Stations
        public ActionResult Index()
        {
            return View("Stations");
        }
    }
}