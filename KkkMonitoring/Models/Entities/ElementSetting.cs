using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace KkkMonitoring.Models.Entities
{
    public class ElementSetting
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ElementSettingId { get; set; }
        public virtual ICollection<ParameterSetting> Parameters { get; set; }
    }
}