using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Model.Entities
{
    public class Element
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ElementId { get; set; }
        public virtual string Name { get; set; }
        public ICollection<ParameterSetting> Parameters { get; set; }

    }
}