;var OLMap = (function ($) {

    var _cache = {
        visibleFeaturesCount: 0
    };

    var mapObjectFactory = {
        _styleCache: {},

        init: function (props) {
            /* ???? */
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

        createIconFeature: function (coord) {
            return new ol.Feature({
                geometry: new ol.geom.Point(coord),
                
            });
        },

        getClusterIconStyleFunc: function (feature, resolution) {
            var size = feature.get('features').length;
            var style = this.styleCache[size];
            if (!style) {
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        stroke: new ol.style.Stroke({
                            color: '#fff'
                        }),
                        fill: new ol.style.Fill({
                            color: '#3399CC'
                        })
                    }),
                    text: new ol.style.Text({
                        text: size.toString(),
                        fill: new ol.style.Fill({
                            color: '#fff'
                        })
                    })
                });
                this.styleCache[size] = style;
            }
            return style;
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
//            style: mapObjectFactory.getClusterIconStyleFunc,
            source: new ol.source.Cluster({
                distance: 40,
                source: new ol.source.Vector({features: []})
            })
        }),
        simpleLayer: new ol.layer.Vector({
            source: new ol.source.Vector({ features: [] }),
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    })
                })
            })
        })
        
    };
    var _defaultMinZoom = 3;
    var _view = new ol.View({
        zoom: 2,
        center: [300000, -50000]
    });
    
    var _interations = {};

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
            view: _view
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

        if (props.stations && props.stations.length) {
            addStations(props.stations);
        }

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

    function _getCurrentMapExtent() {
        return _view.calculateExtent(_map.getSize());
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

    function addStations(stations) {
        if (!stations.length && !$.isArray(stations)) {
            return;
        }
        
        $.map(stations, function (station) {
            if (!$.isNumeric(station.longitude) && !$.isNumeric(station.latitude)) {
                console.error("invalid coordinates for station");
                return;
            }
            var coords = ol.proj.fromLonLat([
                parseFloat(station.longitude),
                parseFloat(station.latitude)
            ]);
            _mapLayers.simpleLayer.getSource().addFeature(new ol.Feature({
                geometry: new ol.geom.Point(coords)
            }));
        });
    }

    return {
        initMap: initMap,
        addStation: addStations,
        updateStationState: updateStationState,
        positioningMapToStation: positioningMapToStation,
        updateSize: updateMapSize,
        reRenderMap: reRenderMap,
        getLonLatByPxCoord: getLonLatByPxCoord
    };

})(jQuery);