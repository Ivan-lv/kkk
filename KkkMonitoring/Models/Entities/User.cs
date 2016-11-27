using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace KkkMonitoring.Models.Entities
{
    public class User : IdentityUser
    {
        public User()
        {
        }

        private string pwd;
        [NotMapped]
        public string Password
        {
            get { return pwd; }
            set
            {
                pwd = value;
                using (SHA1Managed sha1 = new SHA1Managed())
                {
                    var hash = sha1.ComputeHash(Encoding.UTF8.GetBytes(value));
                    PasswordHash = Convert.ToBase64String(hash);
                }
            }
        }

        public bool IsValid()
        {
            var addr = new EmailAddressAttribute();

            return 
                    addr.IsValid(Email) && 
                    !string.IsNullOrWhiteSpace(this.UserName) &&
                    !string.IsNullOrWhiteSpace(this.PasswordHash);
        }

        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(UserManager<User> manager)
        {
            //TODO: синхронизировать с настройками в Startup.cs

            ClaimsIdentity claimsIdentity = new ClaimsIdentity(DefaultAuthenticationTypes.ApplicationCookie, ClaimTypes.NameIdentifier, ClaimTypes.Role);
            claimsIdentity.AddClaim(new Claim(ClaimTypes.NameIdentifier, this.Id));

            return claimsIdentity;
        }
    }
}