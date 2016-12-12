; var Sidebar = (function ($) {

    var ELEMENT_ID = "Sidebar-left";

    /* init */
    $(function () {
        TreeViewModule.setCallback("onSelect", onClickTreeElement);
    });


    function onClickTreeElement(element) { onSelectTreeNodeHandler(element); };

    function onSelectTreeNodeHandler(element) {
        StationCard.openCard(element.id, element);
//        console.log(element);
//        console.log("treeelement callback");
//        console.log(this);
    }

    function setTreeDatasource(data) {
        TreeViewModule.setDataSource(data);
    }

    return {
        setTreeDatasource: setTreeDatasource
    };

})(jQuery);