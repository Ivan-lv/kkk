using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using KkkMonitoring.Models.Entities;

namespace KkkMonitoring.Models.Models
{
    public class Model : DbContext
    {
        public Model() : base("ConnStr")
        {
        }

        public DbSet<Element>  Elements { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("public");
            base.OnModelCreating(modelBuilder);
        }
    }
}