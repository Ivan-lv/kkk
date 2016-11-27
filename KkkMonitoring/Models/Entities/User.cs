using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace KkkMonitoring.Models.Entities
{
    public class User : IdentityUser
    {
        /// <summary>
        /// Хэшированный пароль
        /// </summary>
        public string Password { get; set; }

        public bool IsValid()
        {
            var addr = new EmailAddressAttribute();
            return addr.IsValid(Id);
        }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager)
        {
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            return userIdentity;
        }
    }
}