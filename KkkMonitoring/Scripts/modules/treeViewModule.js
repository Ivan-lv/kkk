/* plugin for drawing buttons after node text */
(function ($, undefined) {
    "use strict";

    var _i18nCache = undefined;

    $(function () {
        _i18nCache = {
            tooltip: $.i18n.prop('zoom_to_station') || ""
        };
    });
    var span = document.createElement('SPAN');
    span.className = "jstree-fitMapToIconBtn";
    $.jstree.plugins.fitMapToIconBtn = function (options, parent) {
        var classNames = "";
        if (options.iconName && typeof options.iconName === 'string') {
            classNames = options.iconName.trim();
        }
        span.className = "jstree-fitMapToIconBtn " + classNames;
        span.title = _i18nCache.tooltip;
        var handler = (typeof options.click === 'function') ? options.click : null;

        this.redraw_node = function (obj, deep, callback) {
            obj = parent.redraw_node.call(this, obj, deep, callback);
            if (obj && obj.lastChild && obj.lastChild.attributes["data-stationstate"]) {
                var tmp = span.cloneNode(true);
                tmp.onclick = handler;
                obj.appendChild(tmp, obj.childNodes[2]);
            }
            return obj;
        };
    };
})(jQuery);


/* treeview module */

var TreeViewModule = (function () {
    var _jsTree = undefined;
    var _jsTreeInstance = undefined;
    var _lastChecked = [];
    var searchTimerId = false;
    var NODE_TYPE_NAMES = {
        'company': 'COMPANY',
        'country': 'COUNTRY',
        'oilfield': 'OILFIELD',
        'cluster': 'CLUSTER',
        'well': 'WELL'
    };
    var _defaultTreeOpt = {
        core: {
            themes: {
                theme: 'default',
                icon: false,
                dots: false
            },
            data: []
        },
        plugins: ['checkbox', 'wholerow', 'types', 'search', 'fitMapToIconBtn'],
        checkbox: {
            tie_selection: false,
            whole_node: false
        },
        search: {
            show_only_matches: true,
            show_only_matches_children: true
        },
        fitMapToIconBtn: {
            iconName: "fa fa-map-marker",
            click: _onClickToNodeRightBtn
        },
        types: {
            'COMPANY': {},
            'COUNTRY': {},
            'OILFIELD': {},
            'CLUSTER': {},
            'WELL': {}
        }
    };

    $(function () {
        _initTree();
        $('#search-input').keyup(_searchInTree);
    });

    function _onLoadTree() {
        _jsTree.jstree('hide_dots');
        _jsTree.jstree('hide_icons');
        _jsTree.jstree('open_all');
    }

    function _initTree() {
        _jsTree = $('#treeView');
        _jsTree.jstree(_defaultTreeOpt).bind('loaded.jstree', _onLoadTree);
        _jsTree.bind('select_node.jstree', _onSelectNode);
        _jsTree.bind('check_node.jstree', _onCheckNode);
        _jsTree.bind('uncheck_node.jstree', _onUncheckNode);
        _jsTreeInstance = _jsTree.jstree(true);
    }

    function _convertData(dataSource) {
        if (!$.isArray(dataSource)) {
            dataSource = [];
        }
        var data = JSON.parse(JSON.stringify(dataSource)); // hack - deep clone array
        try {
            $.map(data, _walkForTree);
        } catch (e) {
            return undefined;
        }

        return data;
    }

    function _walkForTree(node) {
        node.text = node.name;
        node.realId = node.id;
        var type = '';
        node.a_attr = '#';
        if (node.hasOwnProperty('countries')) {
            type = NODE_TYPE_NAMES['company'];
        } else if (node.hasOwnProperty('oilfields')) {
            type = NODE_TYPE_NAMES['country'];
        } else if (node.hasOwnProperty('clusters')) {
            type = NODE_TYPE_NAMES['oilfield'];
        } else if (node.hasOwnProperty('wells')) {
            type = NODE_TYPE_NAMES['cluster'];
        } else {
            type = NODE_TYPE_NAMES['well'];
            node.a_attr = {
                'href': '#/scheme/well/',
                'data-stationstate': node.state
            };
        }
        node.type = type;
        node.id = node.treeId;
        if (node.selected) {
            _lastChecked.push(node.id);
        }
        node.children = node.countries || node.oilfields || node.clusters || node.wells || [];

        $.map(node.children, _walkForTree)
    }

    function _onSelectNode(event, data) {
        if (data.node.type === NODE_TYPE_NAMES['well']) {
            window.location.hash = data.node["a_attr"].href;
            $.publish('tree:stationSelected', [data.node.original.realId]);
        }

        $.publish('tree:nodeSelected', data.node.original);
    }

    function _onCheckNode(event, data) {
        _publishCheckedStationsIds(data.node);
    }

    function _publishCheckedStationsIds(checkedNode) {
        var curCheckedSubNodes = _jsTreeInstance.get_json(checkedNode, {flat: true, no_data: true});
        var staitonsIds = _filterWellsIds(curCheckedSubNodes);
        $.publish('tree:nodeCheck', [staitonsIds]);
    }

    function _publishUncheckedStationsIds(checkedNode) {
        var curCheckedNodes = _jsTreeInstance.get_json(checkedNode, {flat: true, no_data: true});
        var stationsIds = _filterWellsIds(curCheckedNodes);
        $.publish('tree:nodeUncheck', [stationsIds]);
    }

    function _filterWellsIds(nodesColleciton) {
        var res = [];
        $.map(nodesColleciton, function (node) {
            if (node.type === NODE_TYPE_NAMES['well']) {
                res.push(node.id);
            }
        });
        return _toOriginalId(res);
    }

    function _findStationObjectNodeById(stationId) {
        var treeData = _jsTreeInstance.get_json(_jsTree, {flat: true});
        var res = $.grep(treeData, function (node) {
            return _toOriginalId([node.id]) == stationId && node.type === NODE_TYPE_NAMES['well'];
        });

        // if(res.length === 1) {
        return res;
        // }
        // console.error('bag!');
    }

    function _onUncheckNode(event, data) {
        _publishUncheckedStationsIds(data.node);
    }

    function _toOriginalId(ids) {
        $.map(ids, function (id, index) {
            ids[index] = id.substr(id.lastIndexOf('_') + 1);
        });

        return ids;
    }

    // function _toInnderId(id, typeName) {
    //   if (NODE_TYPE_NAMES[typeName]) {
    //     return NODE_TYPE_NAMES[typeName] + '#_' + id;
    //   }
    //
    //   return undefined;
    // }

    function _searchInTree() {
        var _$self = $(this);
        if (searchTimerId) {
            clearTimeout(searchTimerId);
        }
        searchTimerId = setTimeout(function () {
            var v = _$self.val();
            _jsTreeInstance.search(v);
        }, 250);
    }

    function _onClickToNodeRightBtn(e) {
        var $jsTreeNodeHtml = $(e.target).closest('.jstree-node');
        if (!$jsTreeNodeHtml.length) {
            return;
        }
        var node = _jsTreeInstance.get_node($jsTreeNodeHtml);
        if (node.type === NODE_TYPE_NAMES['well']) {
            var stationId = node.original.realId;
            // $.publish('tree:nodeCheck', [[stationId], {positioningMap: true}]);
            $.publish('tree:clickToFitMapForStationBtn', [stationId]);
            // _jsTreeInstance.check_node($jsTreeNodeHtml);

        }
    }

    function setDataSource(dataSource) {
        var defer = $.Deferred();
        var convertedData = _convertData(dataSource);
        if (!convertedData) {
            /* todo: error message ?? */
            return;
        }

        _jsTreeInstance.settings.core.data = convertedData;
        _jsTree.jstree('refresh')
            .bind('refresh.jstree', _onLoadTree)
            .bind('refresh.jstree', function () {
                checkNodes(_lastChecked);
                defer.resolve();
            });

        return defer.promise();
    }

    function getSelectedNodes() {
        var res = [];
        var selectedNodeIds = _jsTreeInstance.get_selected(true);
        $.map(selectedNodeIds, function (node) {
            res.push(node.original);
        });

        return res;
    }

    function getCheckedNodes() {
        var res = [];
        var checkedNodes = _jsTreeInstance.get_checked(true);
        $.map(checkedNodes, function (node) {
            res.push(node.original);
        });

        return res;
    }

    /*
     * depricated
     * */
    // function selectNodes(nodeIdents) {
    //   if (nodeIdents instanceof Array && nodeIdents.length) {
    //     _jsTreeInstance.select_node(nodeIdents);
    //   }
    // }

    function selectStationNodeById(stationId) {
        _jsTreeInstance.deselect_all();
        var obj = _findStationObjectNodeById(stationId);
        if (obj.length !== 1) {
            return;
        }
        _jsTreeInstance.select_node(obj[0].id);
    }

    function checkNodes(nodeIdents) {
        if (nodeIdents instanceof Array && nodeIdents.length) {
            _jsTreeInstance.check_node(nodeIdents);
        }
    }

    function disableAllCheckboxes() {
        var allNodes = _jsTreeInstance.get_json(_jsTree, {flat: true});
        _jsTreeInstance.disable_checkbox(allNodes);
    }

    function enableAllCheckboxes() {
        var allNodes = _jsTreeInstance.get_json(_jsTree, {flat: true});
        _jsTreeInstance.enable_checkbox(allNodes);
    }

    function getCheckedStationIds() {
        var checkedBottomNodesIds = _jsTreeInstance.get_bottom_checked();
        return _toOriginalId(checkedBottomNodesIds);
    }

    function getSelectedStationId() {
        var selectedNodeIds = _jsTreeInstance.get_selected(true);
        return selectedNodeIds[0].original.realId;
    }

    function checkStationNodeById(stationId) {
        var obj = _findStationObjectNodeById(stationId);
        if (obj.length !== 1) {
            return;
        }
        _jsTreeInstance.check_node(obj);
    }

    function disableNotStationsNodes() {
        var allNodes = _jsTreeInstance.get_json(_jsTree, {flat: true});
        $.map(allNodes, function (node) {
            if (node.type !== NODE_TYPE_NAMES['well']) {
                _jsTreeInstance.disable_node(node);
            }
        });
    }

    function changeStationState(stationId, stateIdent) {
        var obj = _findStationObjectNodeById(stationId);
        var stationNode = _jsTreeInstance.get_node(obj[0].id);
        if (!stationNode) {
            return;
        }
        stationNode.a_attr['data-stationstate'] = stateIdent;
        _jsTreeInstance.refresh_node(stationNode.id);
        _jsTreeInstance.redraw([stationNode.id]);
    }

    function enableNotStationsNodes() {
        var allNodes = _jsTreeInstance.get_json(_jsTree, {flat: true});
        $.map(allNodes, function (node) {
            if (node.type !== NODE_TYPE_NAMES['well']) {
                _jsTreeInstance.enable_node(node);
            }
        });
    }

    function hidePanMapBtns() {
        _jsTree.addClass('disablePanBtn');
    }

    function showPanMapBtns() {
        _jsTree.removeClass('disablePanBtn');
    }

    /* export methods */
    return {
        getSelectedNodes: getSelectedNodes,
        getCheckedNodes: getCheckedNodes,
        // selectNodes: selectNodes,
        checkStationNodeById: checkStationNodeById,
        setDataSource: setDataSource,
        disableAllCheckboxes: disableAllCheckboxes,
        disableNotStationsNodes: disableNotStationsNodes,
        enableAllCheckboxes: enableAllCheckboxes,
        enableNotStationsNodes: enableNotStationsNodes,
        getSelectedStationId: getSelectedStationId,
        getCheckedStationIds: getCheckedStationIds,
        selectStationNodeById: selectStationNodeById,
        changeStationState: changeStationState,
        hidePanMapBtns: hidePanMapBtns,
        showPanMapBtns: showPanMapBtns
    };

})();