using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace KkkMonitoring.Controllers
{
    [RoutePrefix("Login")]
    public class LoginController : Controller
    {
        public AutorizationManager Manager => Request.GetOwinContext().GetUserManager<AutorizationManager>();

        public async Task<bool> Authenticate(string name, string password)
        {
            if (await Manager.FindAsync(name, password) != null)
            {
                return true;
            }

            return false;
        }

        // GET: Login
        [Route("")]
        public ActionResult Login()
        {
            return View();
        }

        public ActionResult SignUp()
        {
            return View();
        }
    }
}