using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using KkkMonitoring.Models.Entities;
using Microsoft.AspNet.Identity.EntityFramework;

namespace KkkMonitoring.Models.Models
{
    public class GeneralModel : IdentityDbContext<User>
    {
        public DbSet<Station> Stations { get; set; }

        public GeneralModel() : base("ConnStr")
        {
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            base.OnModelCreating(modelBuilder);
        }
    }
}