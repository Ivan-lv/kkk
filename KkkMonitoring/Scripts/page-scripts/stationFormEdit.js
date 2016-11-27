(function ($) {

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
            field: "name",
            title: "Наименование"
        },
        {
            field: "type",
            title: "Тип",
            formatter: attrTypeColFormatter
        }
    ];

    var testData = [
        {
            name: "11",
            type: "tInt"
        },
        {
            name: "21",
            type: "tBool"
        }
    ];

    var attrTable = undefined;

    $(function() {
        OLMap.initMap({ target: "mapContainerEdit" });
        attrTable = $("#bs-table-attr");
        attrTable.bootstrapTable({
            search: true,
            pagination: true,
            pageSize: 15,
            toolbar: "#bs-toolbox",
            sortable: true,
            columns: bsTableCols,
            data: testData
        });

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
            type: $("#attrType-modal").val() || ""
        }
    }


})(jQuery);