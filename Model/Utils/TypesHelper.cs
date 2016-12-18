using System;
using System.Collections.Generic;
using System.ComponentModel;
using Model.Entities;

namespace Model.Utils
{
    public static class TypesHelper
    {
        private static readonly Dictionary<Type, string> translations = new Dictionary<Type, string>()
        {
            [typeof(bool)] = "Логический",
            [typeof(string)] = "Строковая",
            [typeof(int)] = "Целое число",
            [typeof(float)] = "Число с плавающей запятой",
        };

        public static string GetTypeName(Type type)
        {
            if (translations.ContainsKey(type))
            {
                return translations[type];
            }
            throw new ArgumentException("Был передан неизвестный тип данных");
        }

        public static bool IsCorrect(string value, Type type)
        {
            if (value == null)
                return true;

            var converter = TypeDescriptor.GetConverter(type);
            return converter.IsValid(value);
        }

        public static Object CastToType(string value, Type type)
        {
            if (value == null)
            {
                //Булево значение кастуем по-особенному
                if (type == ParameterSetting.TypeBinding[ParameterSetting.ParameterType.tBool])
                {
                    return false;
                }
                return null;
            }

            var converter = TypeDescriptor.GetConverter(type);
            return converter.ConvertFromString(value);
        }

        public static bool TryCastToNumber(object value, Type type, out double parsedValue)
        {
            var converter = TypeDescriptor.GetConverter(type);
            if (converter.CanConvertTo(typeof(Double)))
            {
                parsedValue = value != null ? 
                                (Double) converter.ConvertTo(value, typeof(Double)) :
                                Double.Epsilon; //null-значение считаем валидным и приводим его к бесконечно малой
                return true;
            }

            parsedValue = Double.MaxValue;
            return false;
        }
    }
}