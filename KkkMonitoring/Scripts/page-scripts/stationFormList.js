(function ($) {

    var bsTableCols = [
        {
            field: "Primarykey",
            visible: false
        },
        {
            checkbox: true
        },
        {
            field: "Name",
            title: "Наименование"
        },
        {
            field: "Coordinates",
            title: "Широта, долгота"
        }
    ];

    $(function () {
        var stationsTable = $("#bs-table-stations");
        $( document ).ready(function() {
            var data = JSON.parse($("#stations-data").val());
            stationsTable.bootstrapTable({
                search: true,
                pagination: true,
                pageSize: 15,
                toolbar: "#bs-toolbox",
                sortable: true,
                columns: bsTableCols,
                data: data,
                onClickRow: function (row) {
                    window.location.href = "/Stations/Edit?Id=" + row.Primarykey;
                }
            });
        });

        $("#addBtn").on("click", onClickAddAttrBtn);
        $("#editBtn").on("click", onClickEditAttrBtn);
    });

    function onClickAddAttrBtn() {
        window.location.href = "/Stations/Create";
    }

    function onClickEditAttrBtn() {

    }

})(jQuery);