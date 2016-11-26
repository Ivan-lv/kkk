using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace KkkMonitoring.Models.Entities
{
    public class Station
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid StationId { get; set; }
        public virtual string Name { get; set; }
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }
        public virtual ICollection<ParameterValue> Parameters { get; set; }
    }
}