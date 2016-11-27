(function ($) {
    /* conf */
    var ALERTS_HTML_CONTAINER_CLASS= "alerts-wrap";
    var SHOWING_ALERTS_INTERVAL = 10000;
    var OPACITY_INTERVAL = 3000;
    var ALERT_SETTINGS_BY_TYPE = {
        'danger': {
            ident: 'danger',
            audioSrc  : './resources/sounds/station-alarm.mp3',
            loop : true,
            style: 'panel-danger'
        },
        'warning': {
            ident: 'warning',
            audioSrc  : './resources/sounds/station-alarm.mp3',
            loop : true,
            style: 'panel-warning'
        },
        'success': {
            ident: 'success',
            audioSrc  : undefined,
            loop : false,
            style: 'panel-success'
        },
        'info': {
            ident: 'info',
            audioSrc  : undefined,
            loop : false,
            style: 'panel-info'
        }
    };
    var DefaultProps = {
        alertTypeIdent: "",
        title: "",
        titleUrl: "",
        message: "",
        autoClose: true,
        sound: false,
        icon: undefined,
        showBuletInNotification: false
    };
    var $alertsContainer = undefined;

    /* init notifications */
    $(function () {
        document.alertsSounds = {};
        $alertsContainer = $('body').children('.' + ALERTS_HTML_CONTAINER_CLASS);
        if (!$alertsContainer.length) {
            $alertsContainer = $('<div class="' + ALERTS_HTML_CONTAINER_CLASS + '"></div>');
            $('body').append($alertsContainer)
        }

        $.subscribe('alert:show', showAlert);
    });

    function showAlert(e, props) {
        var options = $.extend({}, DefaultProps, props);

        if (!ALERT_SETTINGS_BY_TYPE.hasOwnProperty(options.alertTypeIdent) ||
            (!options.title && !options.message)) {
            return;
        }

        var $alertHtml = getAlertHtml( options );

        $alertHtml.find('button.close').off('click').on('click', destroyAlert.bind($alertHtml, options.alertTypeIdent));
        $alertHtml.hover(
            function () {
                $(this).animate({opacity: 1}, 300);
            },
            function () {
                $(this).animate({opacity: 0.5}, 300);
            }
        );

        /* if not danger type - change opacity after OPACITY_INTERVAL ms */
        if (options.alertTypeIdent !== 'danger') {
            setTimeout(function () {
                $alertHtml.animate({opacity: 0.5}, 1500);
            }, OPACITY_INTERVAL);
        }

        if (options.sound && ALERT_SETTINGS_BY_TYPE[options.alertTypeIdent].audioSrc) {
            playSound(ALERT_SETTINGS_BY_TYPE[options.alertTypeIdent]);
        }

        if (options.autoClose) {
            setTimeout( destroyAlert.bind($alertHtml, options.alertTypeIdent), SHOWING_ALERTS_INTERVAL );
        }

        $('.' + ALERTS_HTML_CONTAINER_CLASS).append($alertHtml);
        $alertHtml.find('.alert-timeago').timeago();
        $alertHtml.hide();
        $alertHtml.slideDown(500);


        /* show buletIn notification */
        if (options.showBuletInNotification) {
            showBuiltInNotification(options);
        }
    }

    function destroyAlert(alertTypeIdent) {
        stopSoundPlaying(alertTypeIdent);
        this.fadeOut(750, function () {
            this.remove();
        });
    }

    function getAlertHtml(options) {
        var $alertContainer = $(
            '<div class="panel">' +
            '<div class="panel-heading">' +
            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
            '<h3 class="panel-title"></h3>' +
            '</div>' +
            '<div class="panel-body"></div>' +
            '<div class="panel-footer">' +
                '<div class="alert-timeago" style="text-align: right"></div>' +
            '</div>' +
            '</div>'
        );
        $alertContainer.addClass(ALERT_SETTINGS_BY_TYPE[options.alertTypeIdent].style);
        var $alertTitleHtml = $alertContainer.find('h3');
        if (options.titleUrl) {
            $('<a></a>')
                .attr("title", $.i18n.prop('go_to_well'))
                .attr('href', options.titleUrl)
                .text(options.title)
                .append(' <span class="fa fa-arrow-circle-right"/>')
                .appendTo($alertTitleHtml);
        } else {
            $alertTitleHtml.text(options.title);
        }

        $alertContainer.find('.panel-body').html($.parseHTML(options.message));
        $alertContainer.find('.alert-timeago').attr('title', new Date().toISOString());

        return $alertContainer;
    }

    function playSound(alertType) {
        if (!document.alertsSounds[alertType.ident]) {
            document.alertsSounds[alertType.ident] = new buzz.sound(alertType.audioSrc);
        }

        var sound = document.alertsSounds[alertType.ident];
        if (!alertType.loop) {
            sound.play();
            return;
        }

        if (sound.isPaused()) {
            sound.loop().play();
        }
    }

    function stopSoundPlaying(alertTypeIdent) {
        if(!document.alertsSounds[alertTypeIdent]) {
            return;
        }
        var sound = document.alertsSounds[alertTypeIdent];
        if (!ALERT_SETTINGS_BY_TYPE[alertTypeIdent].loop) {
            sound.pause();
        }
        
        if($alertsContainer.find("." + ALERT_SETTINGS_BY_TYPE[alertTypeIdent].style).length > 1) {
            return;
        }
        sound.pause();
    }

    function showBuiltInNotification(props /*body, settings*/) {
        // if(props.showBuiltInNotification) {
            if (!("Notification" in window)) {
                console.log("This browser does not support desktop notification");
                return;
            }

            var showNotificationImpl = function() {
                var title = props.builtInNotificationTitle || props.title;
                var tag = props.tag || title + props.message;

                new Notification(title, {
                    body: props.builtInNotificationMessage,
                    tag: tag,
                    icon: convertNotificationTypeToBuiltInNotificationIcon(props.stationStateIdent),
                    onclick: function() {
                        window.focus();
                        this.cancel();
                    }
                });
            };

            if (Notification.permission === "granted") {
                showNotificationImpl();
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function (permission) {
                    if (permission === "granted") {
                        showNotificationImpl();
                    }
                });
            }
        }
    // }

    function convertNotificationTypeToBuiltInNotificationIcon(stationStateIdent) {
        switch (stationStateIdent) {
            case "STARTED":
            {
                return './resources/img/notifications/icon-station-started.png';
            }
            case "STOPPED":
            case "FAILURE":
            {
                return './resources/img/notifications/icon-station-stopped.png';
            }

            case "BLOCK":
            case "WAITING_FOR_APV":
            {
                return './resources/img/notifications/icon-station-apv.png';
            }

            case "NOT_RESPONDING":
            case "ROUTER_IS_NOT_RESPONDING":
            case "NOT_ADDED" :
            {
                return './resources/img/notifications/icon-notResponding.png';
            }

            default: return undefined;
        }
    }

})(jQuery);
