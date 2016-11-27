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

namespace KkkMonitoring.Models.Models
{
    public class ApplicationUserModel : IdentityDbContext<User>
    {
        public ApplicationUserModel() : base("ConnStr")
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
    }
}