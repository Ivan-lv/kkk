using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace ParameterWriter
{
    [ServiceContract]
    public interface IParameterWriter
    {
        [OperationContract]
        List<StationDescription> GetStationDesctiption(string name, string id);

        [OperationContract]
        void WriteParameters(ParamValue[] parameters);
    }

    [DataContract]
    public class ParamValue
    {
        [DataMember]
        public string Value { get; set; }

        [DataMember]
        public string ParameterId { get; set; }
    }

    [DataContract]
    public class StationDescription
    {
        [DataMember]
        public string Name;

        [DataMember]
        public string Id;

        [DataMember]
        public ParameterDescription[] parameters;
    }

    [DataContract]
    public class ParameterDescription
    {
        [DataMember]
        public string Id;

        [DataMember]
        public string Name;

        [DataMember]
        public string DataType;

        [DataMember]
        public string Comment;
    }
}
