using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Routing;
using KkkMonitoring.Models.Models;

namespace KkkMonitoring
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            Database.SetInitializer(new CreateDatabaseIfNotExists<ParameterMonitoring>());
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<ApplicationUserModel>());
            Database.SetInitializer(new DropCreateDatabaseIfModelChanges<StationModel>());
        }
    }
}
