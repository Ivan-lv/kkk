;var OLMap = (function ($) {

    var _cache = {
        visibleFeaturesCount: 0
    };

    var mapObjectFactory = {

        init: function (props) {
            /* ???? */
        },

        _onChangeMapProp: function (e, initCoords) {
            var widgetOverlay = e.target;
            $(widgetOverlay.getElement()).wellDialog('initScrollbars');
            var $widgetParent = $(widgetOverlay.getElement()).parent();
            $widgetParent.draggable({
                drag: $.throttle(30, false, this._updateLineCoords.bind(this, widgetOverlay)),
                stop: this._onWidgetDragStop.bind(this, widgetOverlay)
            });
        },

        _onWidgetDragStop: function (wo) { /* wo - widget overlay */
            var woOffset = this._calcWidgetOffsetInPx(wo);
            wo.setOffset(woOffset);
            if (wo.get('dataSource')) {
                wo.get('dataSource').widgetOffset = woOffset;
            }
        },

        _calcWidgetOffsetInPx: function (wo) { /* wo - widget overlay */
            var woParentHtmlElem = wo.getElement().parentNode;
            var woPositionInPx = wo.getMap().getPixelFromCoordinate(wo.getPosition());
            var woElemCoordInPx = [woParentHtmlElem.offsetLeft, woParentHtmlElem.offsetTop];
            return [
                woElemCoordInPx[0] - woPositionInPx[0],
                woElemCoordInPx[1] - woPositionInPx[1]
            ];
        },

        _updateLineCoords: function (wo) { /* wo - widget overlay */
            var startCoord = wo.getPosition();
            var startCoordInPx = _map.getPixelFromCoordinate(startCoord);
            var $widget = $(wo.getElement());
            var widgetParent = $widget[0].parentNode;
            var widgetPoint = $widget.wellDialog('getPoint', 'pointForConLine');
            var widgetXCenter = widgetParent.offsetLeft + $widget.width() / 2;

            if (startCoordInPx[0] > widgetXCenter && widgetPoint.parameters.side === 'left' ||
                startCoordInPx[0] < widgetXCenter && widgetPoint.parameters.side === 'right') {

                $widget.wellDialog('mirrorPoint', 'pointForConLine');
                wo.get('lineFeature').set('offsetX', widgetPoint.html.position().left + 5);
            }

            /* get from style, because when dom element not rendered it offset equals 0 */
            var widgetOffsetInPx = [
                parseFloat(widgetParent.style.left) || widgetParent.offsetLeft || 0,
                parseFloat(widgetParent.style.top) || widgetParent.offsetTop || 0
            ];

            var endCoord = wo.getMap().getCoordinateFromPixel([
                widgetOffsetInPx[0] + wo.get('lineFeature').get('offsetX'),
                widgetOffsetInPx[1]
            ]);

            wo.get('lineFeature').getGeometry().setCoordinates([startCoord, endCoord]);
        },

        _getSingleStationIconStyleFunc: function (feature, resolution) {
            var prop = feature.getProperties();
            if (prop.hidden) {
                return;
            }

            return this._createSingleStationIconStyle(prop.state)
        },

        _getStationsGroupIconStyleFunc: function (data, size) {
            var chartImg = this._getStationStateDonutChart(data);

            return [
                new ol.style.Style({
                    image: new ol.style.Icon({
                        anchor: [0.5, 0.65],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        opacity: 0.95,
                        scale: 1,
                        src: './resources/img/map-icon-well.png'
                    })
                }),
                new ol.style.Style({
                    image: new ol.style.Icon({
                        img: chartImg,
                        imgSize: [chartImg.width, chartImg.height]
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        offsetY: -20,
                        offsetX: 17
                    })
                })
            ];
        },

        _createSingleStationIconStyle: function (state, img) {
            return new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.65],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 0.95,
                    scale: 1,
                    src: this._getStationStateIconUrl(state),
                    img: img,
                    imgSize: img ? [img.width, img.height] : undefined
                })
            });
        },

        _getStationStateIconUrl: function (state) {
            switch (state) {
                case "STARTED":
                {
                    return "./resources/img/map-icon-well-on.png";
                }
                case "STOPPED":
                case "FAILURE":

                {
                    return "./resources/img/map-icon-well-off.png";
                }

                case "WAITING_FOR_APV":
                case "BLOCK":
                {
                    return "./resources/img/map-icon-well-not-responding.png";
                }

                case "NOT_RESPONDING":
                case "ROUTER_IS_NOT_RESPONDING":
                case "NOT_ADDED":
                {
                    return "./resources/img/map-icon-well-not-added.png";
                }
            }
        },

        _getStationStateDonutChart: function (data) {
            var canvas = document.createElement('canvas');
            var radius = 12;
            canvas.width = radius * 2;
            canvas.height = radius * 2;
            var ctx = canvas.getContext('2d');

            var lastend = 0;
            var total = 0;
            var colors = ['#ef4314', '#faac18', '#99bd1b', '#ffffff'];

            /* drawing chart */
            for (var e = 0; e < data.length; e++) {
                total += data[e];
            }

            for (var i = 0; i < data.length; i++) {
                var deltaAngle = Math.PI * 2 * (data[i] / total);
                ctx.beginPath();
                ctx.fillStyle = colors[i];
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius, lastend, lastend + deltaAngle, false);
                lastend += deltaAngle;
                ctx.fill();
            }
            /* drawing white bg */
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.fillStyle = "#dadada";
            ctx.arc(radius, radius, 7, 0, Math.PI * 2);
            ctx.fill();
            /* drawing black point */
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.arc(radius, radius, 3, 0, Math.PI * 2);
            ctx.fill();

            return canvas;
        },

        _calcNumStationStates: function (features) {
            var stationStates = [0, 0, 0, 0]; /*indexes: 0-red, 1-yellow, 2-green, 3-white*/

            $.map(features, function (feature) {
                switch (feature.get('state')) {
                    case 'STARTED':
                        stationStates[2]++;
                        break;
                    case "WAITING_FOR_APV":
                    case "BLOCK":
                        stationStates[1]++;
                        break;
                    case "STOPPED":
                    case "FAILURE":
                        stationStates[0]++;
                        break;
                    case "NOT_RESPONDING":
                    case "ROUTER_IS_NOT_RESPONDING":
                        stationStates[3]++;
                        break;
                }
            });

            return stationStates;
        },

        clusterWidgetDataNameFormatter: function (props) {
            var a = document.createElement('a');
            a['href'] = $.isNumeric(props.stationId) ? ('#/scheme/well/' + props.stationId) : "#";
            a.appendChild(document.createTextNode(props.stationName));

            return a.outerHTML;
        },

        clusterWidgetDataValueFormatter: function (stateIdent) {
            var $span = $("<span></span>");
            switch (stateIdent) {
                case "STARTED":
                {
                    $span
                        .addClass('stationStateIcon station-state-start')
                        .attr('title', "Запущена");
                }break;

                case "STOPPED":
                case "FAILURE":
                {
                    $span
                        .addClass('stationStateIcon station-state-stop')
                        .attr('title', "Остановлена");
                }break;

                case "WAITING_FOR_APV":
                case "BLOCK":
                {
                    $span
                        .addClass('stationStateIcon station-state-apv')
                        .attr('title', "АПВ");
                }break;

                case "NOT_RESPONDING":
                {
                    $span
                        .addClass('stationStateIcon station-state-notresponding')
                        .attr('title', "Не отвечает");
                }break;

                case "ROUTER_IS_NOT_RESPONDING":
                {
                    $span
                        .addClass('stationStateIcon station-state-routerNotResponding')
                        .attr('title', "Роутер не отвечает");
                }
            }

            return $span.prop('outerHTML');
        },

        createStationVisualObj: function (station, props) {
            props = props || {};

            //longitude and latitude comes from server with swapped position
            var stationCoord = ol.proj.fromLonLat([
                station.location[1],
                station.location[0]
            ]);

            var widgetOverlay = this.createWidgetOverlay({
                id: station.id,
                title: station.name,
                visible: false,
                position: stationCoord,
                initCoords : station.initCoord,
                widgetOffset : station.widgetOffset,
                valueFormatter : props.valueFormatter,
                nameFormatter : props.nameFormatter,
                customCssClass: props.customCssClass,
                dataSource: station
            });

            /* ??? */
            var lineFeature = this.createLineFeature(stationCoord, stationCoord);
            
            /* workaround */
            widgetOverlay.once('change:map', function () {
                var lineFeatureOffsetXEndCoord =
                    $(widgetOverlay.getElement()).wellDialog('getPoint', 'pointForConLine').parameters.side === "left" ?
                        0 :
                        $(widgetOverlay.getElement()).width();
                lineFeature.set("offsetX", lineFeatureOffsetXEndCoord);
            }.bind(this));
            
            lineFeature.setId(station.id);
            lineFeature.setProperties({
                offsetX: 0,
                offsetY: 0,
                wo: widgetOverlay,
                hidden: true
            });

            var stationIconFeature = this.createIconFeature(stationCoord);
            stationIconFeature.setId(station.id);
            stationIconFeature.setProperties({
                state: station.state,
                stationName: station.name,
                wo: widgetOverlay,
                lineFeature: lineFeature
            });

            widgetOverlay.set("lineFeature", lineFeature);

            var widgetDataLoadPromise = $.getJSON( // deferred object
                './api/v1/wellAttributesSchema/map/' + station.id,
                function (json) {
                    var widgetData = convertRegistersInfo(json.attrs, station.id);
                    $(widgetOverlay.getElement()).wellDialog('option', {data: widgetData});
                }
            );

            return {
                lineFeature: lineFeature,
                iconFeature: stationIconFeature,
                widgetOverlay: widgetOverlay,
                widgetDataLoadPromise: widgetDataLoadPromise
            }
        },

        createLineFeature: function (startCoord, endCoord) {
            return new ol.Feature(new ol.geom.LineString([startCoord, endCoord]));
            // line.set('hidden', true);
        },

        createIconFeature: function (coord) {
            return new ol.Feature({
                geometry: new ol.geom.Point(coord)
            });
        },

        createWidgetHtml: function (props) {
            var $div = $('<div></div>');
            $div.wellDialog({
                xPos: 0,
                yPos: -20,
                title: props.title || "",
                theme: props.theme || "dw-dark",
                data: props.data || {},
                visible: props.visible || false,
                bodyVisibility: true,
                buttonForToggleBody: true,
                manuallyInitScrollbar: true,
                scrollbarTheme: 'minimal-dark',
                valueFormatter: props.valueFormatter || false,
                nameFormatter: props.nameFormatter || false,
                customCssClass: props.customCssClass,
                height: props.height || undefined,
                maxHeight: props.maxHeight || 350
            });

            return $div;
        },

        getLineStyleFunc: function (feature) {
            if (feature.get('hidden')) {
                return;
            }

            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(33, 33, 33, 0)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(33, 33, 33, 1)',
                    width: 1
                }),
                geometry: function (feature) {
                    var widgetOverlay = feature.get('wo');
                    var $widgetHtmlParent = widgetOverlay.getElement().parentNode;
                    var woPositionInPx = [
                        $widgetHtmlParent.offsetLeft + feature.get('offsetX'),
                        $widgetHtmlParent.offsetTop
                    ];
                    var woLineFeatureCoord = [
                        widgetOverlay.getPosition(),
                        _map.getCoordinateFromPixel(woPositionInPx)
                    ];

                    return new ol.geom.LineString(woLineFeatureCoord);
                }.bind(this)
            });
        },

        getClusterIconStyleFunc: function (feature, resolution) {
            var features = feature.get('features');
            var size = features.length;
            if (size === 1 && features[0].get('state')) {
                var style = mapObjectFactory._createSingleStationIconStyle(
                    features[0].get('state')
                );
                // features[0].get('lineFeature').set('hidden', false);
                // $(features[0].get('wo').getElement()).fadeIn();
                return style;
            }

            // $.map(features, function (feature) {
            //     var widget = $(feature.get('wo').getElement());
            //     if (widget.css('display') === 'block') {
            //         widget.fadeOut();
            //     }
            //     feature.get('lineFeature').set('hidden', true);
            // });
            style = mapObjectFactory._getStationsGroupIconStyleFunc(
                mapObjectFactory._calcNumStationStates(features),
                size
            );

            return style;
        },
        setPointForWidget: function ($widgetHtml, widgetOverlay) {
            $widgetHtml.wellDialog('addPoint', {
                side: widgetOverlay.getOffset()[0] >= 0 ? 'left' : 'right',
                offset: 14,
                name: 'pointForConLine'
            });

        },
        createWidgetOverlay: function (props) {
            props = props || {};
            var $widgetHtml = this.createWidgetHtml({
                theme: props.theme || 'dw-light',
                visible: props.visible || false,
                title: props.title || "",
                valueFormatter: props.valueFormatter || false,
                nameFormatter: props.nameFormatter || false,
                escapeText: props.escapeText,
                customCssClass: props.customCssClass || "",
                manuallyInitScrollbar: true,
                maxHeight: props.maxHeight || 300
            });
            var widgetOverlay = new ol.Overlay({
                element: $widgetHtml[0],
                position: props.position || undefined,
                id: props.id
            });

            if (props.widgetOffset) {
                widgetOverlay.setOffset(props.widgetOffset);
                this.setPointForWidget($widgetHtml, widgetOverlay);
            } else if (props.initCoords && $.isNumeric(props.initCoords.offsetX)
                && $.isNumeric(props.initCoords.offsetY)){

                widgetOverlay.setOffset([
                    props.initCoords.offsetX,
                    props.initCoords.offsetY
                ]);

            } else {
                widgetOverlay.setOffset([80, 80]);
            }
            this.setPointForWidget($widgetHtml, widgetOverlay);
            if (props.dataSource) {
                widgetOverlay.set('dataSource', props.dataSource);
            }

            /* when map assign */
            widgetOverlay.once('change:map', this._onChangeMapProp, this);

            return widgetOverlay;
        }
    };
    
    var _map = null;
    var _mapTargetHtmlElem = undefined;
    var _mapLayers = {
        baseMap: new ol.layer.Tile({
            source: new ol.source.OSM({
                wrapDateLine: false,
                wrapX: true,
                noWrap: true,
                url: 'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            })
        }),
        iconClusterLayer: new ol.layer.Vector({
            style: mapObjectFactory.getClusterIconStyleFunc,
            source: new ol.source.Cluster({
                distance: 40,
                source: new ol.source.Vector()
            })
        }),
        lineLayer: new ol.layer.Vector({
            source: new ol.source.Vector({features: [], wrapX: false}),
            style: mapObjectFactory.getLineStyleFunc,
            updateWhileAnimating: true
        })
        
    };
    var _defaultMinZoom = 3;
    var _view = new ol.View({
        zoom: 2,
//        minZoom: _defaultMinZoom,
        center: [300000, -50000]
    });
    var _customMapControls = {
        autoFitMap: function (opt_options) {
            var options = opt_options || {};

            var button = document.createElement('button');
            button.innerHTML = 'A';
            button.title = "Автоподгонка карты";
            var this_ = this;
            var toggleAutoFit = function () {
                var fit = this_.getMap().get('autoFit');
                this_.getMap().set('autoFit', !fit);
                $(this_.element).find('button').toggleClass('active');
            };

            button.addEventListener('click', toggleAutoFit, false);
            button.addEventListener('touchstart', toggleAutoFit, false);

            var element = document.createElement('div');
            element.className = 'auto-fit ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });

        },
        panAll: function (opt_options) {
            var options = opt_options || {};
            var button = document.createElement('button');
            button.innerHTML = '<span class="fa fa-life-ring" style="font-size: 14px;"></span>';
            button.title = "Охватить все станции";
            button.addEventListener('click', positioningMapForVisibleStations, false);
            button.addEventListener('touchstart', positioningMapForVisibleStations, false);

            var element = document.createElement('div');
            element.className = 'pan-all-stations ol-unselectable ol-control';
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });
        }
    };
    var _interations = {};
    
    function _getMapControls() {
        ol.inherits(_customMapControls.autoFitMap, ol.control.Control);
        ol.inherits(_customMapControls.panAll, ol.control.Control);
        return ol.control.defaults({
            attributionOptions: ({
                collapsible: false
            })
        }).extend([
            //new _customMapControls.autoFitMap(),
            //new _customMapControls.panAll(),
            new ol.control.ZoomSlider()
        ]);
    }

    function initMap(props) {
        if (!props.target) {
            return;
        }

        _view.setZoom(props.zoom || _defaultMinZoom);

        if (props.center && $.isNumeric(props.center.latitude) && $.isNumeric(props.center.longitude)){
            _view.setCenter([props.center.latitude, props.center.longitude]);
        }

        _mapTargetHtmlElem = document.getElementById(props.target);
        _map = new ol.Map({
            target: props.target,
            layers: _objToArrayOfValue(_mapLayers),
            overlays: [],
            view: _view,
            //controls: _getMapControls()
        });
        _interations.clickByIcon = new ol.interaction.Select({
            layers: [_mapLayers.iconClusterLayer],
            style: mapObjectFactory._getSingleStationIconStyleFunc
        });
        _interations.clickByIcon.getFeatures().on('add', _onClickByStationIcon);
        _map.addInteraction(_interations.clickByIcon);
        _map.on('pointermove', _hoverPointer);
        _map.set('autofit', false);

        _mapLayers.iconClusterLayer.getSource()
            .on('removefeature', _onRemoveClusterFeature);

        _map.on("moveend", _onMoveEnd);
        _map.on("postcompose", $.debounce(2000, false, function () {
            $.publish('map:changed');
        }));

        _mapLayers.iconClusterLayer.getSource().on("removefeature", function (e) {
            var iconFeature = e.feature;
            var iconFeatureProps = iconFeature.getProperties();
            if (iconFeatureProps.features.length === 1 && iconFeatureProps.features[0].get("lineFeature").get('hidden')) {
                console.log(iconFeatureProps.features[0].get("lineFeature").get('hidden'));
                $(iconFeatureProps.features[0].get("wo").getElement()).fadeOut();
                iconFeatureProps.features[0].get("lineFeature").set('hidden', true);
                console.log("deleted:");
                console.log(iconFeature);
                return;
            }
        });

        _mapLayers.iconClusterLayer.getSource().on("addfeature", function (e) {
            var iconFeature = e.feature;
            var iconFeatureProps = iconFeature.getProperties();
            if (iconFeatureProps.features.length === 1) {
                $(iconFeatureProps.features[0].get("wo").getElement()).fadeIn();
                iconFeatureProps.features[0].get("lineFeature").set('hidden', false);
                console.log("added:");
                console.log(iconFeature);
                return;
            }

            /* hide widgets for singles stations icons */
            $.map(iconFeatureProps.features, function (feature) {
                $(feature.get("wo").getElement()).fadeOut();
                feature.get("lineFeature").set('hidden', true);
            });
        });

        _map.addOverlay(new ol.Overlay({
            id: "marker",
            element: _getMarkerElement(),
            positioning: "bottom-center",
            position: undefined
        }));
    }

    function _hoverPointer(event) {
        if (event.dragging) {
            return;
        }
        var stationIconFeature = _map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
            return feature;
        }, null, function (layer) {
            return layer == _mapLayers.iconClusterLayer
        }, this);
        var hit = (stationIconFeature && stationIconFeature.get("features").length === 1) ? true : false;
        _mapTargetHtmlElem.style.cursor = hit ? 'pointer' : '';
    }

    function _onClickByStationIcon(event) {
        var cluster = event.element;
        var clusterFeatures = cluster.get('features');

        if (clusterFeatures.length && clusterFeatures.length === 1) {
            var stationId = $.isNumeric(clusterFeatures[0].getId()) ? clusterFeatures[0].getId() : undefined;
            if (!stationId) {
                return;
            }
            document.location = "#/scheme/well/" + stationId;
        }

        _interations.clickByIcon.getFeatures().clear();
    }

    function _objToArrayOfValue(obj) {
        return $.map(obj, function (item) {
            return item
        })
    }

    function _setStationVisualObj(stationVisObj) {
        if (stationVisObj.lineFeature) {
            _mapLayers.lineLayer.getSource().addFeature(stationVisObj.lineFeature);
        }
        if (stationVisObj.iconFeature) {
            _mapLayers.iconClusterLayer.getSource().getSource().addFeature(stationVisObj.iconFeature);
        }
        if (stationVisObj.widgetOverlay) {
            _map.addOverlay(stationVisObj.widgetOverlay);
        }
    }

    function _getCurrentMapExtent() {
        return _view.calculateExtent(_map.getSize());
    }

    function _createClusterWidget(clusterIconFeature) {
        var widgetOverlay = mapObjectFactory.createWidgetOverlay({
            title: "Колличество скважин: " + clusterIconFeature.get("features").length,
            valueFormatter: mapObjectFactory.clusterWidgetDataValueFormatter,
            nameFormatter: mapObjectFactory.clusterWidgetDataNameFormatter,
            customCssClass: "stationGroupWidget",
            position: clusterIconFeature.getGeometry().getCoordinates()
        });

        var lineEndCoord = _map.getCoordinateFromPixel([
            widgetOverlay.getElement().parentNode.offsetLeft,
            widgetOverlay.getElement().parentNode.offsetTop
        ]);

        var lineFeature = mapObjectFactory.createLineFeature(feature.getGeometry().getCoordinates(), lineEndCoord);

        /* workaround */
        _map.once('postrender', function () {
            var lineFeatureOffsetXEndCoord =
                $(widgetOverlay.getElement()).wellDialog('getPoint', 'pointForConLine').parameters.side === "left" ?
                    0 :
                    $(widgetOverlay.getElement()).width();
            lineFeature.set("offsetX", lineFeatureOffsetXEndCoord);
        });

        lineFeature.setProperties({
            'offsetX': 0,
            'offsetY': 0,
            'hidden': false,
            'wo' : widgetOverlay
        });
        clusterIconFeature.set('lineFeature', lineFeature);
        clusterIconFeature.set('wo', widgetOverlay);
        widgetOverlay.set('lineFeature', lineFeature);
        var features = featureProps.features;
        var $widget = $(widgetOverlay.getElement());
        var widgetData = [];
        for (var i = 0; i < featureCount; i++) {
            widgetData.push({
                name: {stationName: features[i].get('stationName'), stationId: features[i].getId()},
                value: features[i].get('state')
            })
        }
        $widget.wellDialog('addRows', widgetData);

        return {
            lineFeature: lineFeature,
            widgetOverlay: widgetOverlay
        }
    }

    function _createClustersWidgets() {
        return;
        _mapLayers.iconClusterLayer.getSource().forEachFeatureInExtent(_getCurrentMapExtent(), function (feature) {
            var featureProps = feature.getProperties();
            if (featureProps.wo) { /* wo - widget overlay */
                // console.log(feature);
                return;
            }
            var featureCount = featureProps.features.length;
            if (featureCount < 2) {
                return
            }
            var widgetOverlay = mapObjectFactory.createWidgetOverlay({
                title: "Количество скважин: " + featureCount,
                valueFormatter: mapObjectFactory.clusterWidgetDataValueFormatter,
                nameFormatter: mapObjectFactory.clusterWidgetDataNameFormatter,
                customCssClass: "stationGroupWidget",
                position: feature.getGeometry().getCoordinates()
            });

            var lineEndCoord = _map.getCoordinateFromPixel([
                widgetOverlay.getElement().parentNode.offsetLeft,
                widgetOverlay.getElement().parentNode.offsetTop
            ]);

            var lineFeature = mapObjectFactory.createLineFeature(feature.getGeometry().getCoordinates(), lineEndCoord);
            
            /* workaround */
            _map.once('postrender', function () {
                var lineFeatureOffsetXEndCoord =
                    $(widgetOverlay.getElement()).wellDialog('getPoint', 'pointForConLine').parameters.side === "left" ?
                        0 :
                        $(widgetOverlay.getElement()).width();
                lineFeature.set("offsetX", lineFeatureOffsetXEndCoord);
            });
            
            lineFeature.setProperties({
                'offsetX': 0,
                'offsetY': 0,
                'hidden': false,
                'wo' : widgetOverlay
            });
            feature.set('lineFeature', lineFeature);
            feature.set('wo', widgetOverlay);
            widgetOverlay.set('lineFeature', lineFeature);
            var features = featureProps.features;
            var $widget = $(widgetOverlay.getElement());
            var widgetData = [];
            for (var i = 0; i < featureCount; i++) {
                widgetData.push({
                    name: {stationName: features[i].get('stationName'), stationId: features[i].getId()},
                    value: features[i].get('state')
                })
            }
            $widget.wellDialog('addRows', widgetData);
            _setStationVisualObj({
                lineFeature: lineFeature,
                widgetOverlay: widgetOverlay
            });
            $widget.fadeIn();
            // console.log('create');
        });
    }

    function _onMoveEnd() {
        _createClustersWidgets();
    }

    function _onRemoveClusterFeature(e) {
        var feature = e.feature;
        if (feature.get('features').length > 1) {
            var wo = feature.get('wo');
            if (wo) {
                $(wo.getElement()).fadeOut();
                _unsetStationVisualObj({
                    lineFeature  : feature.get('lineFeature'),
                    widgetOverlay: wo
                });
                // console.log('remove');
            }

        }
    }

    function _unsetStationVisualObj(stationVisObj) {
        if (stationVisObj.lineFeature) {
            _mapLayers.lineLayer.getSource().removeFeature(stationVisObj.lineFeature);
            stationVisObj.lineFeature.setProperties({});
        }
        if (stationVisObj.iconFeature) {
            _mapLayers.iconClusterLayer.getSource().getSource().removeFeature(stationVisObj.iconFeature);
            stationVisObj.iconFeature.setProperties({});
        }
        if (stationVisObj.widgetOverlay) {
            _map.removeOverlay(stationVisObj.widgetOverlay);
            stationVisObj.widgetOverlay.setProperties({});
        }
    }

    function showStations(stations, fitMap) {
        var deferred = $.Deferred();
        var stationsPromises = [deferred.promise()];
        _map.once('postrender', function () {
            fitMap = (typeof fitMap !== "boolean") ? _map.get('autoFit') : fitMap;
            var stationCount = stations.length;
            for (var i = 0; i < stationCount; i++) {
                var stationIconFeature =
                    _mapLayers.iconClusterLayer.getSource().getSource().getFeatureById(stations[i].id);
                if (stationIconFeature !== null) {
                    continue;
                }
                var visObj = mapObjectFactory.createStationVisualObj(stations[i]);
                _setStationVisualObj(visObj);
                stationsPromises.push(visObj.widgetDataLoadPromise);
            }

            if (fitMap) {
                setTimeout(positioningMapForVisibleStations, 250);
            }
            _createClustersWidgets();

            deferred.resolve();
        }, this);
        _map.render();
        return $.when.apply(this, stationsPromises);
    }


    function _getMarkerElement() {
        var $span = $("<span style='font-size: 32px'></span>");
        $span.addClass("glyphicon glyphicon-map-marker");
        return $span[0];
    }

    /**
     *
     * @param targetObject - maybe a ol.extent or ol.geometery
     * @param options - object contains maxZoom and padding properties
     * @private
     */
    function _panMapTo(targetObject, options) {
        options = options || {};
        var animationDuration = 900;
        var panAnimation = ol.animation.pan({
            duration: animationDuration,
            source: _view.getCenter()
        });
        var zoomAnimation = ol.animation.zoom({
            resolution: _view.getResolution(),
            duration: animationDuration
        });

        _map.beforeRender(panAnimation, zoomAnimation);
        _view.fit(targetObject, _map.getSize(), {
            padding: options.padding || [70,70,70,70],
            maxZoom: options.maxZoom || 11
        });

        setTimeout(function() {
            updateLinesCoordinates()
        }, 1000);
    }

    function positioningMapForVisibleStations() {
        if ( _mapLayers.iconClusterLayer.getSource().getFeatures().length === 0 ) {
            return;
        }
        var stationsExtent = _mapLayers.iconClusterLayer.getSource().getSource().getExtent();
        if (!stationsExtent) {
            return;
        }

        _panMapTo(stationsExtent, {padding: [30,30,30,30]})

    }

    function hideStations(stationsIds, fitMap) {
        fitMap = (typeof fitMap !== "boolean") ? _map.get('autoFit') : fitMap;
        if (!$.isArray(stationsIds)) {
            return;
        }

        for (var i = stationsIds.length - 1; i >= 0; i--) {
            _unsetStationVisualObj({
                lineFeature   : _mapLayers.lineLayer.getSource().getFeatureById(stationsIds[i]),
                iconFeature   : _mapLayers.iconClusterLayer.getSource().getSource().getFeatureById(stationsIds[i]),
                widgetOverlay : _map.getOverlayById(stationsIds[i])
            });
        }
        if (fitMap) {
            setTimeout(positioningMapForVisibleStations, 250);
        }

        _createClustersWidgets();
    }

    function getCenter() {
        return _view.getCenter();
    }

    function getZoomValue() {
        return _view.getZoom();
    }

    function updateStationState(stationId, stateIdent) {
        var stationIconFeature =
            _mapLayers.iconClusterLayer.getSource().getSource().getFeatureById(stationId);
        if (!stationIconFeature) {
            return;
        }

        stationIconFeature.set('state', stateIdent);
    }

    function positioningMapToStation(stationId) {
        var iconFeature =
            _mapLayers.iconClusterLayer.getSource().getSource().getFeatureById(stationId);
        if (iconFeature === null) {
            return;
        }

        _panMapTo(iconFeature.getGeometry())

    }

    function updateMapSize() {
        _map.updateSize();
    }

    function getStationsWidgetCoordsById(stationsIds) {
        stationsIds = stationsIds || [];
        return $.map(stationsIds, function (stationId) {
            var stationWidgetOverlay = _map.getOverlayById(stationId);
            if (stationWidgetOverlay !== null) {
                /*
                * writing offset in pixels instead of coordinates.
                * */
                return {
                    stationId: stationId,
                    location: {
                        offsetX: stationWidgetOverlay.getOffset()[0],//coord[0],
                        offsetY: stationWidgetOverlay.getOffset()[1]//coord[1]
                    }
                };
            }
        });
    }

    function updateLinesCoordinates() {
        _map.getOverlays().forEach(function (widgetOverlay) {
            mapObjectFactory._updateLineCoords(widgetOverlay);
        });
    }

    function reRenderMap() {
        updateLinesCoordinates();
        _map.render();
    }

    function showMarker(coords) {
        _map.getOverlayById("marker").setPosition(coords);
    }

    function getLonLatByPxCoord(pxCoord, markerVisibility) {
        var projectedCoords = _map.getCoordinateFromPixel(pxCoord);
        if (markerVisibility) {
            showMarker(projectedCoords);
        }

        return ol.proj.toLonLat(projectedCoords);

    }

    return {
        initMap: initMap,
        showStations: showStations,
        hideStations: hideStations,
        getCenter: getCenter,
        getZoomValue: getZoomValue,
        updateStationState: updateStationState,
        positioningMapToStation: positioningMapToStation,
        updateSize: updateMapSize,
        getStationsWidgetCoordsById: getStationsWidgetCoordsById,
        positioningMapForVisibleStations: positioningMapForVisibleStations,
        reRenderMap: reRenderMap,
        getLonLatByPxCoord: getLonLatByPxCoord
    };

})(jQuery);