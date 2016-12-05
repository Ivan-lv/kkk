using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace KkkMonitoring.Models.Entities
{
    public class ParameterSetting
    {
        /// <summary>
        /// Тип данных для значения параметра.
        /// </summary>
        public enum ParameterType
        {
            tString,
            tFloat,
            tInt,
            tUint,
            tBool
        }

        /// <summary>
        /// Описание интерпретации типов данных.
        /// </summary>
        [NotMapped]
        public static readonly Dictionary<ParameterType, Type> TypeBinding = new Dictionary<ParameterType, Type>()
        {
            [ParameterType.tFloat] = typeof(Double),
            [ParameterType.tString] = typeof(String),
            [ParameterType.tInt] = typeof(Int32),
            [ParameterType.tUint] = typeof(UInt32),
            [ParameterType.tBool] = typeof(Boolean)
        };

        /// <summary>
        /// Первичный ключ параметра.
        /// </summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public virtual Guid ParameterId { get; set; }

        [Required]
        public virtual string Name { get; set; }

        /// <summary>
        /// Тип данных параметра.
        /// </summary>
        [Required]
        public virtual ParameterType DataType { get; set; }
    }
}