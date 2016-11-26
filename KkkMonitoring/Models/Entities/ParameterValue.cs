using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        private string value;

        [NotMapped]
        public string Value
        {
            get
            {
                return value;
            }

            set
            {
                Type type = ParameterSetting.TypeBinding[Setting.DataType];
                if (TypesHelper.IsCorrect(value, type))
                {
                    this.value = value;
                };

                throw new ArgumentException("Неверный формат для заданного типа");
            }
        }
    }
}