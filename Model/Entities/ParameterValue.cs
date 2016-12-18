using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;
using Model.Utils;

namespace Model.Entities
{
    public class ParameterValue
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ParameterId { get; set; }

        public ParameterSetting Setting { get; set; }

        public Station Station { get; set; }

        public string ValueDb { get; set; }

        [NotMapped]
        public string Value
        {
            get
            {
                return ValueDb;
            }

            set
            {
                var type = CsType;
                if (TypesHelper.IsCorrect(value, type))
                {
                    this.ValueDb = TypesHelper.CastToType(value, type)?.ToString();
                }
                else
                {
                    throw new ArgumentException("Неверный формат для заданного типа");
                }
            }
        }

        [NotMapped]
        public Object ParsedObject => TypesHelper.CastToType(ValueDb, GetType());

        [NotMapped]
        public Type CsType => ParameterSetting.TypeBinding[Setting.DataType];

        public class ParameterValueConfiguration : EntityTypeConfiguration<ParameterValue>
        {
            public ParameterValueConfiguration()
            {
                Property(x => x.ValueDb);
            }
        }
    }
}