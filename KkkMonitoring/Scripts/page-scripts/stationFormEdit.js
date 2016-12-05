(function ($) {

    //TODO: передавать данные с сервера
    var attrTypeNames = {
        tString: "Строка",
        tFloat: "Число с плавающей запятой",
        tInt: "Целое",
        tUint: "Целое положительное",
        tBool: "Логический"
    };

    var bsTableCols = [
        {
            checkbox: true
        },
        {
            field: "id",
            visible: false
        },
        {
            field: "name",
            title: "Наименование"
        },
        {
            field: "type",
            title: "Тип",
            formatter: attrTypeColFormatter
        },
        {
            field: "isEdited",
            visible: false
        }
    ];

    var attrTable = undefined;
    var nameInput = undefined;
    var latInput = undefined;
    var longInput = undefined;
    var stationId = undefined;

    $(function () {

        nameInput = $("#stationName");
        latInput = $("#latitudeVal");
        longInput = $("#longitudeVal");
        attrTable = $("#bs-table-attr");

        OLMap.initMap({ target: "mapContainerEdit" });

        var data = $("#station-data").val();
        var paramData = [];
        if (data) {
            var station = JSON.parse(data);
            stationId = station.id,
            nameInput.val(station.name);
            latInput.val(station.latitude);
            longInput.val(station.longitude);
            paramData = station.parameters;
        }

        attrTable.bootstrapTable({
            search: true,
            pagination: true,
            pageSize: 15,
            toolbar: "#bs-toolbox",
            sortable: true,
            columns: bsTableCols,
            data: paramData
        });

        $("#saveBtn").on("click", submitForm);

        $("#addBtn").on("click", onClickAddAttrBtn);
        $("#editBtn").on("click", onClickEditAttrBtn);
        $("#removeBtn").on("click", onClickRemoveAttrBtn);

        $("#mapContainerEdit").on("click", onClickByMap);
    });

    function onClickByMap(e) {
        var lonlat = OLMap.getLonLatByPxCoord([e.offsetX, e.offsetY], true);
        $("#longitudeVal").val(lonlat[1]);
        $("#latitudeVal").val(lonlat[0]);
    }

    function onClickAddAttrBtn() {
        clearAttrModal();
        $("#tableRowView").modal("show");
        $("#attrModal-successBtn").one("click", addAttrToTable);
    }
    function onClickEditAttrBtn() {
        var selectedAttrRows = attrTable.bootstrapTable("getSelections");
        if (selectedAttrRows.length !== 1) {
            $(this).popover({
                title: "Ой!",
                content: "выберете 1 строку для редактирования",
                placement: "top",
                trigger: "focus"
            }).popover("show");

            $(this).one("hidden.bs.popover", function() {
                $(this).popover("destroy");
            });

            return;
        }
        clearAttrModal();
        $("#attrModal-successBtn").one("click", editAttrValues);
        $("#tableRowView .modal-title").text("Редактирование атрибута");
        $("#attrName-modal").val(selectedAttrRows[0].name);
        $("#attrType-modal").val(selectedAttrRows[0].type);
        $("#tableRowView").modal("show");
    }

    function onClickRemoveAttrBtn() {
        var selectedAttrRows = attrTable.bootstrapTable("getSelections");
        if (selectedAttrRows.length === 0) {
            return;
        }
        $("#confirmModal .modal-body").text("Удалить выбранные атрибуты?");
        $("#confirmModal-successBtn").one("click", removeAttrs);
        $("#confirmModal").modal("show");
    }

    function addAttrToTable() {
        attrTable.bootstrapTable("append", getValuesFromAttrModal());

        /* todo: ajax here */
    }
    function editAttrValues() {
        var attrValues = getValuesFromAttrModal();
        var $selectedRow = attrTable.find("tr.selected");
        if (!$selectedRow.length) {
            return;
        }
        attrTable.bootstrapTable("updateRow", { index: $selectedRow.data("index"), row: attrValues });

        /* todo: ajax here */
    }
    function removeAttrs() {
        /* todo: ajax here */
    }

    //TODO: сделать что-нибудь, чтобы передавать url, и данные модели
    function submitForm() {
        var parameters = attrTable.bootstrapTable("getData");

        var name = nameInput.val();
        var long = longInput.val();
        var lat = latInput.val();
        var paramToServ = $.map(parameters, function (element) {
            if (element.isEdited) {
                var tuple = { Item1: element.id, Item2: element.type, Item3: element.name }
                return tuple;
            }
        });

        $.ajax({
            type: "POST",
            traditional: true,
            dataType: "json",
            url: "/Stations/CreateEdit",
            beforeSend: function () {
                waitingDialog.show("Идет сохранение...");
            },
            data: {
                primarykey: stationId,
                name: name,
                longitude: parseFloat(long).toFixed(2).replace(/\./g, ','),
                latitude: parseFloat(lat).toFixed(2).replace(/\./g, ','),
                parametersJson: JSON.stringify(paramToServ)
            },
            cache: false,
            error: function (e) {
                waitingDialog.hide();
                console.log(e);
            },
            success: function () {
                waitingDialog.hide();
                window.location.href = "/Stations";
            }
        });
    }

    function attrTypeColFormatter(value, row, index) {

//        var select = $("<select></select>");
//        $.map(attrTypeNames, function(attrName, attrIdent) {
//            $("<option></option>")
//                .attr('value', attrIdent)
//                .text(attrName)
//                .appendTo(select);
//        });

        if (attrTypeNames.hasOwnProperty(value)) {
            //            select.val(value);
            return attrTypeNames[value];
        } else {
            return "нет такого!";
        }

//        return select[0].outerHTML;
    }

    function attrTypeCellStyle() {
        return {
            css: {padding: 0}
        }
    }

    function clearAttrModal() {
        $("#tableRowView .modal-title").empty();
        $("#attrName-modal").val("");
        $("#attrType-modal").val("tString");
    }

    function getValuesFromAttrModal() {
        return {
            name: $("#attrName-modal").val() || "",
            type: $("#attrType-modal").val() || "",
            isEdited: true
        }
    }


})(jQuery);