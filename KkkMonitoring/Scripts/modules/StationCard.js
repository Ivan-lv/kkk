; var StationCard = (function ($) {
    var _settings = {
        cardContainerSelector: "#station-card-container"
    }
    var $CardContainer = undefined;

    /* init card */
    $(function() {
        $CardContainer = $(_settings["cardContainerSelector"]);
        if (!$CardContainer.length) {
            console.error("stationCard: element with selector '" + _settings["cardContainerSelector"] + "' not found");
            return;
        }

        $CardContainer.find("h4").on("click", hideCard);

    });


    /**
     * заполняет поля карточки станции
     * 
     * @param {object} stationInfo 
     * @returns {} 
     */

    function _setDataIntoCard(stationInfo) {
        console.log(stationInfo);
        if (stationInfo && $.isArray(stationInfo.parameters)) {
            var parametersTableBody = $CardContainer.find("table.parameters tbody");
            parametersTableBody.empty();
            $.map(stationInfo.parameters, function (parameter) {
                $("<tr></tr>")
                    .append($("<td>" + (parameter.name || "") + "</td>"))
                    .append($("<td>" + (parameter.value || "") + "</td>"))
                    .appendTo(parametersTableBody);
            });
        }
    }


    /**
     * shows container with station data
     * 
     * @returns undefined 
     */
    function showCard() {
        if (!$CardContainer || !$CardContainer.length) {
            return;
        }
        $CardContainer.fadeIn();
    }



    /**
     * hide container with station data
     * 
     * @returns undefined 
     */
    function hideCard() {
        if (!$CardContainer || !$CardContainer.length) {
            return;
        }

        $CardContainer.fadeOut();
    }



    /**
     * Загружает данные для карточки станции
     * 
     * @param {string} stationId 
     * @param {object} stationData 
     * @returns undefined 
     */
    function openCard(stationId, stationData) {
        if (stationData && $CardContainer.length) {
            $CardContainer
                .find(".stationName")
                .text(stationData.text || "");
        }

        API.getStation(stationId).then(function(stationInfo) {
            _setDataIntoCard(stationInfo);
            showCard();
        });

        
    }

    return {
        openCard: openCard,
        showCard: showCard,
        hideCard: hideCard
    };

})(jQuery);