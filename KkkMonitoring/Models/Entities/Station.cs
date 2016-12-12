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

        [Required]
        public virtual string Name { get; set; }

        [Required]
        public decimal Longitude { get; set; }

        [Required]
        public decimal Latitude { get; set; }

        public virtual ICollection<ParameterValue> Parameters { get; set; }

        public override bool Equals(object obj)
        {
            var stationObj = obj as Station;

            return stationObj?.StationId == this.StationId;
        }

        public override int GetHashCode()
        {
            return this.StationId.GetHashCode();
        }
    }
}