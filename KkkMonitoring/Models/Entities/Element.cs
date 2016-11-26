using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KkkMonitoring.Models.Entities
{
    public class Element
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ElementId { get; set; }
        public virtual string Name { get; set; }
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }
        public ICollection<ParameterValue> ParameterValues { get; set; }

    }
}