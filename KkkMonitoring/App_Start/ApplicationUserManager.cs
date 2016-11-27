using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Entities;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace KkkMonitoring
{
    public class ApplicationUserManager : UserManager<User>
    {
        public ApplicationUserManager(IUserStore<User> store) : base(store)
        {
        }

        public static ApplicationUserManager Create(IdentityFactoryOptions<ApplicationUserManager> options, IOwinContext context)
        {
            ApplicationUserModel model = context.Get<ApplicationUserModel>();
            ApplicationUserManager manager = new ApplicationUserManager(new UserStore<User>(model));
            return manager;
        }

        public async Task CreateUser(User user)
        {
            if (user.IsValid())
            {
                user.SecurityStamp = Guid.NewGuid().ToString();
                await this.Store.CreateAsync(user);
            }
            else
            {
                throw new ArgumentException("Неверный формат данных о пользователе");
            }
        }

        public bool Authenticate(string email, string hashedPwd)
        {
            return Users.FirstOrDefault(x => x.Email == email && x.PasswordHash == hashedPwd) != null;
        }
    }
}