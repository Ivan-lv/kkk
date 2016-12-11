using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Web;
using KkkMonitoring.Models.Utils;

namespace KkkMonitoring.Models.Entities
{
    public class ParameterValue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ParameterId { get; set; }

        public ParameterSetting Setting { get; set; }

        public Station Station { get; set; }

        private string ValueDb { get; set; }

        [NotMapped]
        public string Value
        {
            get
            {
                return ValueDb;
            }

            set
            {
                Type type = ParameterSetting.TypeBinding[Setting.DataType];
                if (TypesHelper.IsCorrect(value, type))
                {
                    this.ValueDb = value;
                }
                else
                {
                    throw new ArgumentException("Неверный формат для заданного типа");
                }
            }
        }

        public class ParameterValueConfiguration : EntityTypeConfiguration<ParameterValue>
        {
            public ParameterValueConfiguration()
            {
                Property(x => x.ValueDb);
            }
        }
    }
}