using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.SignalR;

namespace KkkMonitoring.Models.Models
{
    public class ApplicationUserModel : IdentityDbContext<User>, IUserIdProvider
    {
        public ApplicationUserModel() : base("RightsConnStr")
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            base.OnModelCreating(modelBuilder);
        }

        public static ApplicationUserModel Create()
        {
            return new ApplicationUserModel();
        }

        protected override DbEntityValidationResult ValidateEntity(DbEntityEntry entityEntry,
            IDictionary<object, object> items)
        {
            //TODO: Запилить свою валидацию (email уникальный, Username - нет) 
            return base.ValidateEntity(entityEntry, items);
        }


        public string GetUserId(IRequest request)
        {
            //TODO: Нахер не нужно
            return request.User.Identity.Name;
        }
    }
}