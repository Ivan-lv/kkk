using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using WebGrease.Css.Extensions;

namespace KkkMonitoring.Controllers
{
    [RoutePrefix("Login")]
    public class LoginController : Controller
    {
        public ApplicationUserManager Manager => Request.GetOwinContext().GetUserManager<ApplicationUserManager>();
        public ApplicationSignInManager SignInManager => Request.GetOwinContext().Get<ApplicationSignInManager>();

        // GET: Login
        [Route("")]
        public ActionResult Login()
        {
            return View("Login");
        }

        [HttpPost]
        public ActionResult SignIn(User user)
        {
            if (ModelState.IsValid)
            {
                if (Manager.Authenticate(user.Email, user.PasswordHash))
                {
                    SignInManager.SignIn(user, isPersistent:false, rememberBrowser: false);
                    return RedirectToAction("Map", "Map");
                }
                else
                {
                    View("Login").ViewData["SignInFail"] = true;
                    return View("Login");
                }
            }
            return View();
        }

        public ActionResult SignUp()
        {
            return View("SignUp");
        }

        [HttpPost]
        public async Task<ActionResult> Registration(User user)
        {
            try
            {
                await Manager.CreateUser(user);
            }
            catch (DbEntityValidationException ex)
            {
                string[] errors =
                    ex.EntityValidationErrors.SelectMany(x =>
                        {
                            return x.ValidationErrors.Select(y => y.ErrorMessage);
                        }).ToArray();

                View("SignUp").ViewData["errors"] = errors;
                return View("SignUp");
            }

            return RedirectToAction("Login");
        }
    }
}