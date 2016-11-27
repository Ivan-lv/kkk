using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using KkkMonitoring.Models.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

namespace KkkMonitoring.Models.Models
{
    public class AutorizationModel : IdentityDbContext<User>
    {
        public AutorizationModel() : base("IdentityDb") { }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            base.OnModelCreating(modelBuilder);
        }

        public static AutorizationModel Create()
        {
            return new AutorizationModel();
        }
    }
}