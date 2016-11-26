using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Web;

namespace KkkMonitoring.Models.Utils
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
            var converter = TypeDescriptor.GetConverter(type);
            return converter.IsValid(value);
        }
    }
}