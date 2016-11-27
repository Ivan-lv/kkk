using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using KkkMonitoring.Models.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace KkkMonitoring.Models.Models
{
    public class AutorizationManager : UserManager<User>
    {
        public AutorizationManager(IUserStore<User> store) : base(store)
        {
        }

        public static AutorizationManager Create(IdentityFactoryOptions<AutorizationManager> options, IOwinContext context)
        {
            AutorizationModel model = context.Get<AutorizationModel>();
            AutorizationManager manager = new AutorizationManager(new UserStore<User>(model));
            return manager;
        }
    }
}