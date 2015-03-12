define(['hgn!templates/settings-dialog.html', 'ReaderSettingsDialog_Keyboard', 'i18n/Strings', 'Dialogs', 'storage/Settings', 'Keyboard', 'colpick', 'bootstrap'], function (SettingsDialog, KeyboardSettings, Strings, Dialogs, Settings, Keyboard) {
    var defaultSettings = {
        fontSize: 100,
        syntheticSpread: "auto",
        scroll: "auto",
        columnGap: 60,
        focusSize: "default"
    }

    var getBookStyles = function (readerSettings) {

        var isAuthorTheme = readerSettings.theme === "author-theme";
        var $previewText = $('.preview-text');
        setPreviewTheme($previewText, readerSettings);
        var previewStyle = window.getComputedStyle($previewText[0]);
        var bookStyles = [
            {selector: 'body', declarations: {
                backgroundColor: isAuthorTheme ? "" : previewStyle.backgroundColor,
                color: isAuthorTheme ? "" : previewStyle.color
            }}
        ];

        return bookStyles;
    }

    var setFocusSize = function (focusSize) {

        var focusSizePix;

        if (focusSize == "thin") {
            focusSizePix = 1;
        } else if (focusSize == "heavy") {
            focusSizePix = 5;
        } else {
            focusSizePix = 3;
        }

        var numberOfStylesheets = document.styleSheets.length;

        for (i = 0; i < numberOfStylesheets; i++) {

            var stylesheet = document.styleSheets[i];
            var rules = stylesheet.cssRules || stylesheet.rules;

            for (var j = 0; j < rules.length; j++) {
                if (rules[j].type == 1 && rules[j].selectorText.toLowerCase().indexOf(":focus") > -1) { //find ":focus" rules
                    if (rules[i].style.outlineWidth != "0px") {
                        var alt = "alt" + rules[j].cssText;
                        rules[j].style.setProperty("outline-width", focusSizePix + "px", "important");
                    }
                    if (rules[j].style.borderWidth != "0px") {
                        rules[j].style.setProperty("border-width", focusSizePix + "px", "important");
                    }
                }
            }
        }


    }

    var styleUserInterfaceCSS = function(color, backgroundColor){
        var lumChangePercent;
        var backgroundColorHover;

        //$('*').css("");

        //$("*").css("font-family", "Times New Roman, Times, serif");

        $('#app-navbar').css({'color': color, 'background-color': backgroundColor});
        $('#audioplayer').css({'color': color, 'background-color': backgroundColor});


        /* $('.modal-body').css({'color': color, 'background-color': backgroundColor});
         $('.modal-footer').css({'color': color, 'background-color': backgroundColor});*/
        $('.modal-content').css({'color': color, 'background-color': backgroundColor});

        $(':button').css({'color': color, 'background-color': backgroundColor});

        $("button[class='resetKey']").css({'color': color, 'background-color': backgroundColor});

        $('#app-container').css({'color': color, 'background-color': backgroundColor});

        if (parseInt(backgroundColorHover, 16) > 8421504){
            changePercent = -20;
        }else{
            changePercent = 20;
        }

        backgroundColorHover = colorChangeLuminance (backgroundColor , changePercent);

        //alert (backgroundColor + "  " + backgroundColorHover);

        var numberOfStylesheets = document.styleSheets.length;

        for (i = 0; i < numberOfStylesheets; i++) {

            var stylesheet = document.styleSheets[i];
            var rules = stylesheet.cssRules || stylesheet.rules;

            for (var j = 0; j < rules.length; j++) {

                if (rules[j].type == 1 && rules[j].selectorText.toLowerCase().indexOf(".tooltip-inner") > -1) { //find ":hover" rules
                    rules[j].style.setProperty("color", backgroundColor, "important");
                    rules[j].style.setProperty("background-color", color, "important");
                }

                if (rules[j].type == 1 && rules[j].selectorText.toLowerCase().indexOf(".tooltip-arrow") > -1) { //find ":hover" rules
                    rules[j].style.setProperty("border-bottom-color", color, "important");
                }

                if (rules[j].type == 1 && rules[j].selectorText.toLowerCase().indexOf(":hover") > -1 && rules[j].selectorText.toLowerCase().indexOf("a:hover") == -1) { //find ":hover" rules
                    rules[j].style.setProperty("background-color", backgroundColorHover, "important");
                }
            }
        }
    }

    var setUserInterfaceStyles = function () {

        var theme;
        var color;
        var backgroundColor;
        var backgroundColorHover;
        var UserInterfaceStyles = false;

        Settings.get('reader', function (json) {
            if (json) {
                if (json['theme'] != "author-theme") {
                    theme = json['theme'];
                    color = json['themeColor'].color;
                    backgroundColor = json['themeColor'].backgroundColor;

                    if (color.indexOf('#') === -1) { //color is not hex
                        color = rgb2hex(color); //normalize RGB values e.g. RGB (224, 224, 224) to HEX color values e.g. #e0e0e0
                    }
                    if (backgroundColor.indexOf('#') === -1) {
                        backgroundColor = rgb2hex(backgroundColor);
                    }
                    styleUserInterfaceCSS(color, backgroundColor);
                }
            }
        });
    }

    var setPreviewTheme = function ($previewText, readerSettings) {
        var previewTheme = $previewText.attr('data-theme');
        var newTheme = readerSettings.theme;
        $previewText.removeClass(previewTheme);
        $previewText.addClass(newTheme);
        $previewText.attr('data-theme', newTheme);

        if (isCustomTheme(newTheme))
            setCustomThemeColor($previewText, readerSettings);
        else {
            $previewText.css('color', '').css('background-color', '');
            deleteTemporaryCustomColor();
        }
    }

    var setCustomThemeColor = function ($element, readerSettings) {
        $element.css('color', readerSettings.customThemeColor.customThemeColor);
        $element.css('background-color', readerSettings.customThemeColor.customThemeBackgroundColor);
    }


    var isCustomTheme = function (theme) {
        return theme == "custom-theme";
    }

    var updateReader = function (reader, readerSettings) {
        reader.updateSettings(readerSettings); // triggers on pagination changed

        if (readerSettings.theme) {
            //$("html").addClass("_" + readerSettings.theme);
            $("html").attr("data-theme", readerSettings.theme);

            var bookStyles = getBookStyles(readerSettings);
            reader.setBookStyles(bookStyles);
            $('#reading-area').css(bookStyles[0].declarations);
            $('#readium-toc-body').css(bookStyles[0].declarations);
        }
    }

    var updateSliderLabels = function ($slider, val, txt, label) {
        $slider.attr("aria-valuenow", val + "");
        $slider.attr("aria-value-now", val + "");

        $slider.attr("aria-valuetext", txt + "");
        $slider.attr("aria-value-text", txt + "");

        $slider.attr("title", label + " " + txt);
        $slider.attr("aria-label", label + " " + txt);
    };

    var initCustomThemeDialog = function () {

        $("#custom-theme-radio-div").on("click", function () {
            $('#settings-dialog').modal('hide');
            $("#custom-theme-dialog").modal('show');
        });

        $("#custom-theme-dialog").on('hidden.bs.modal', function () {

            $('#settings-dialog').modal('show');
        });

        $("#custom-theme-ok-btn").on("click", function () {

            var color;
            var backgroundColor;

            color = $('#foreground-color-btn').css("background-color");
            backgroundColor = $('#background-color-btn').css("background-color");

            $('#theme-preview-text').css('color', color);
            $('#theme-preview-text').css('background-color', backgroundColor);


            $('#custom-theme-radio-div').css('color', color);
            $('#custom-theme-radio-div').css('background-color', backgroundColor);

            $('#custom-theme-radio').prop('checked', true);
        });

        $("#custom-theme-dialog").on('hide.bs.modal', function () {

            $("#background-color-btn").colpickHide();
            $("#foreground-color-btn").colpickHide();
            $("#tab-style").prepend($("#theme-preview"));
            $previewText.attr('data-theme', 'custom-theme');
            setTemporaryCustomColor();
        });

        $("#custom-theme-dialog").on('show.bs.modal', function () {

            var rgbFore = $("#custom-theme-radio-div").css("color");
            var rgbBack = $("#custom-theme-radio-div").css("background-color");

            $("#foreground-color-btn").colpickSetColor(rgb2hex(rgbFore));
            $("#background-color-btn").colpickSetColor(rgb2hex(rgbBack));

        });

        $("#custom-theme-dialog").on('shown.bs.modal', function () {
            setTimeout(function () {
                $("#closeCustomThemeCross").focus();
            }, 50);
        });

        function getContrastColor(hexcolor) {

            if (hexcolor[0] == '#')
                hexcolor = hexcolor.substring(1);
            return (parseInt(hexcolor, 16) > 0xffffff / 2) ? '#000000' : '#ffffff';
        }

        $("#foreground-color-btn").colpick({
            layout: 'hex',
            submit: 0,
            colorScheme: 'light',
            onChange: function (hsb, hex, rgb, el, bySetColor) {
                $(el).css('background-color', '#' + hex);

                hex = '#' + hex;
                $(el).css('color', getContrastColor(hex)).css('background-color', hex);

                $('#custom-theme-preview-text').css('color', hex);
            }
        });

        $("#background-color-btn").colpick({
            layout: 'hex',
            submit: 0,
            colorScheme: 'light',
            onChange: function (hsb, hex, rgb, el, bySetColor) {

                hex = '#' + hex;
                $(el).css('color', getContrastColor(hex)).css('background-color', hex);

                $('#custom-theme-preview-text').css('background-color', hex);
            }
        });
    }

    function setTemporaryCustomColor() {

        localStorage["tempThemeColor"] = {
            color: $previewText.css('color'),
            backgroundColor: $previewText.css('background-color')
        }
    }

    function deleteTemporaryCustomColor() {
        localStorage.removeItem("tempThemeColor");
    }

    function isTemporaryCustomColorSet() {
        return localStorage.hasOwnProperty("tempThemeColor");
    }

    var initDialog = function (reader) {
        $('#app-container').append(SettingsDialog({strings: Strings, dialogs: Dialogs, keyboard: Keyboard}));

        $('#author-theme-radio').prop('checked', true);

        $previewText = $('.preview-text');

        $('.theme-option').on('click', function () {

            var newTheme = $(this).attr("data-theme");
            $("#" + newTheme + "-radio").focus();

            if (newTheme != "customTheme") {
                $("#" + newTheme + "-radio").prop('checked', true);
            }

            if (!isCustomTheme(newTheme)) {
                setPreviewTheme($previewText, {theme: newTheme});
            }
        });

        $("input[name='color-theme']").on("focus", function () {
            var themeId = "#" + $(this).attr('id') + "-div";
            $(themeId).css({"outline-style": "solid", "outline-color": "#444444", "outline-width": " 3px"});
        });

        $("input[name='color-theme']").on("blur", function () {
            $(this).parents().css({"outline-style": "none"});
        });

        var $marginSlider = $("#margin-size-input");
        $marginSlider.on("change",
            function () {
                var val = $marginSlider.val();

                updateSliderLabels($marginSlider, val, val + "px", Strings.i18n_margins);
            }
        );

        var $fontSizeSlider = $("#font-size-input");
        $fontSizeSlider.on('change', function () {
            var fontSize = $fontSizeSlider.val();

            $previewText.css({fontSize: (fontSize / 100) + 'em'});

            updateSliderLabels($fontSizeSlider, fontSize, fontSize + '%', Strings.i18n_font_size);
        });

        $('#tab-butt-main').on('click', function () {
            $("#tab-keyboard").attr('aria-expanded', "false");
            $("#tab-main").attr('aria-expanded', "true");
        });
        $('#tab-butt-keys').on('click', function () {
            $("#tab-main").attr('aria-expanded', "false");
            $("#tab-keyboard").attr('aria-expanded', "true");
        });
        $('#buttSave').on('keydown', function (evt) {
            if (evt.which === 9 && !(evt.shiftKey | evt.ctrlKey | evt.metaKey | evt.altKey)) { // TAB pressed
                evt.preventDefault();
                $('#closeSettingsCross').focus();
            }
        });
        $('#closeSettingsCross').on('keydown', function (evt) {
            if (evt.which === 9 && evt.shiftKey) { // shift-TAB pressed
                evt.preventDefault();
                $('#buttSave').focus();
            }
        });
        $('#custom-theme-radio').on('keydown', function (evt) {
            if (evt.which === 13) { // ENTER pressed
                $('#settings-dialog').modal('hide');
                $("#custom-theme-dialog").modal('show');
            }
        });


        $('#settings-dialog').on('hide.bs.modal', function () { // IMPORTANT: not "hidden.bs.modal"!! (because .off() in

            // Safety: "save" button click
            setTimeout(function () {
                $("#keyboard-list").empty();
            }, 500);
        });

        $('#settings-dialog').on('show.bs.modal', function () { // IMPORTANT: not "shown.bs.modal"!! (because .off() in library vs. reader context)

            $('#tab-butt-main').trigger("click");
            KeyboardSettings.initKeyboardList();

            setUserInterfaceStyles();

            setTimeout(function () {
                $('#closeSettingsCross')[0].focus();
            }, 50); //tab-butt-main

            Settings.get('reader', function (readerSettings) {
                readerSettings = readerSettings || defaultSettings;
                for (prop in defaultSettings) {
                    if (defaultSettings.hasOwnProperty(prop) && !readerSettings.hasOwnProperty(prop) && !readerSettings[prop]) {
                        readerSettings[prop] = defaultSettings[prop];
                    }
                }

                $fontSizeSlider.val(readerSettings.fontSize);
                updateSliderLabels($fontSizeSlider, readerSettings.fontSize, readerSettings.fontSize + '%', Strings.i18n_font_size);


                $marginSlider.val(readerSettings.columnGap);
                updateSliderLabels($marginSlider, readerSettings.columnGap, readerSettings.columnGap + "px", Strings.i18n_margins);

                if (readerSettings.syntheticSpread == "double") {
                    $('#two-up-option input').prop('checked', true);
                }
                else if (readerSettings.syntheticSpread == "single") {
                    $('#one-up-option input').prop('checked', true);
                }
                else {
                    $('#spread-default-option input').prop('checked', true);
                }

                if (readerSettings.scroll == "scroll-doc") {
                    $('#scroll-doc-option input').prop('checked', true);
                }
                else if (readerSettings.scroll == "scroll-continuous") {
                    $('#scroll-continuous-option input').prop('checked', true);
                }
                else {
                    $('#scroll-default-option input').prop('checked', true);
                }

                if (readerSettings.focusSize == "thin") {
                    $('#focus-thin-option input').prop('checked', true);
                }
                else if (readerSettings.focusSize == "default") {
                    $('#focus-default-option input').prop('checked', true);
                }
                else {
                    $('#focus-heavy-option input').prop('checked', true);
                }


                if (readerSettings.pageTransition === 0) {
                    $('#pageTransition-1-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 1) {
                    $('#pageTransition-2-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 2) {
                    $('#pageTransition-3-option input').prop('checked', true);
                }
                else if (readerSettings.pageTransition === 3) {
                    $('#pageTransition-4-option input').prop('checked', true);
                }
                else {
                    $('#pageTransition-none-option input').prop('checked', true);
                }

                if (readerSettings.theme) {

                    if (!isTemporaryCustomColorSet()) {
                        setPreviewTheme($previewText, readerSettings);
                        setCustomThemeColor($("#custom-theme-radio-div"), readerSettings);
                        $('#' + readerSettings.theme + '-radio').prop('checked', true);
                    }

                }

                $previewText.css({fontSize: (readerSettings.fontSize / 100) + 'em'});
            });
        });

        var save = function () {

            var readerSettings = {
                fontSize: Number($fontSizeSlider.val()),
                syntheticSpread: "auto",
                columnGap: Number($marginSlider.val()),
                scroll: "auto",
                focusSize: "default"
            };

            if ($('#scroll-doc-option input').prop('checked')) {
                readerSettings.scroll = "scroll-doc";
            }
            else if ($('#scroll-continuous-option input').prop('checked')) {
                readerSettings.scroll = "scroll-continuous";
            }

            if ($('#focus-thin-option input').prop('checked')) {
                readerSettings.focusSize = "thin";
                setFocusSize("thin");

            }
            else if ($('#focus-default-option input').prop('checked')) {
                readerSettings.focusSize = "default";
                setFocusSize("default");

            }
            else if ($('#focus-heavy-option input').prop('checked')) {
                readerSettings.focusSize = "heavy";
                setFocusSize("heavy");
            }

            if ($('#two-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "double";
            }
            else if ($('#one-up-option input').prop('checked')) {
                readerSettings.syntheticSpread = "single";
            }

            if ($('#pageTransition-1-option input').prop('checked')) {
                readerSettings.pageTransition = 0;
            } else if ($('#pageTransition-2-option input').prop('checked')) {
                readerSettings.pageTransition = 1;
            } else if ($('#pageTransition-3-option input').prop('checked')) {
                readerSettings.pageTransition = 2;
            } else if ($('#pageTransition-4-option input').prop('checked')) {
                readerSettings.pageTransition = 3;
            } else {
                readerSettings.pageTransition = -1;
            }

            readerSettings.theme = $previewText.attr('data-theme');

            readerSettings.themeColor = {
                color: $previewText.css('color'),
                backgroundColor: $previewText.css('background-color')
            }

            readerSettings.customThemeColor = {
                customThemeColor: $('#custom-theme-radio-div').css('color'),
                customThemeBackgroundColor: $('#custom-theme-radio-div').css('background-color')
            }

            if (reader) {
                updateReader(reader, readerSettings);
            }

            var keys = KeyboardSettings.saveKeys();

            Settings.get('reader', function (json) {
                if (!json) {
                    json = {};
                }

                for (prop in readerSettings) {
                    if (readerSettings.hasOwnProperty(prop)) {
                        json[prop] = readerSettings[prop];
                    }
                }

                json.keyboard = keys;
                // if (keys)
                // {
                //     for (prop in keys)
                //     {
                //         if (keys.hasOwnProperty(prop))
                //         {
                //             json.keyboard[prop] = keys[prop];
                //         }
                //     }
                // }

                Settings.put('reader', json);

                setTimeout(function () {
                    Keyboard.applySettings(json);
                }, 100);

                setUserInterfaceStyles();
            });
        };

        Keyboard.on(Keyboard.NightTheme, 'settings', function () {

            Settings.get('reader', function (json) {
                if (!json) {
                    json = {};
                }

                var isNight = json.theme === "night-theme";
                json.theme = isNight ? "author-theme" : "night-theme";

                Settings.put('reader', json);

                if (reader) updateReader(reader, json);
            });
        });

        Keyboard.on(Keyboard.SettingsModalSave, 'settings', function () {
            save();
            $('#settings-dialog').modal('hide');
        });

        Keyboard.on(Keyboard.SettingsModalClose, 'settings', function () {
            $('#settings-dialog').modal('hide');
        });

        $('#settings-dialog #buttSave').on('click', save);

        deleteTemporaryCustomColor();
        initCustomThemeDialog();
    }

    function rgb2hex(rgb) {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }

        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
    }

    hex2rgb = function(hex) {
        if (hex.lastIndexOf('#') > -1) {
            hex = hex.replace(/#/, '0x');
        } else {
            hex = '0x' + hex;
        }
        var r = hex >> 16;
        var g = (hex & 0x00FF00) >> 8;
        var b = hex & 0x0000FF;
        return [r,g,b];
    };

    function rgb2hsl(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h, s, l];
    }

    function hsl2rgb(H, S, L) {

        /*
         * H ∈ [0°, 360°)
         * S ∈ [0, 1]
         * L ∈ [0, 1]
         */

        /* calculate chroma */
        var C = (1 - Math.abs((2 * L) - 1)) * S;

        /* Find a point (R1, G1, B1) along the bottom three faces of the RGB cube, with the same hue and chroma as our color (using the intermediate value X for the second largest component of this color) */
        var H_ = H / 60;

        var X = C * (1 - Math.abs((H_ % 2) - 1));

        var R1, G1, B1;

        if (H === undefined || isNaN(H) || H === null) {
            R1 = G1 = B1 = 0;
        }
        else {

            if (H_ >= 0 && H_ < 1) {
                R1 = C;
                G1 = X;
                B1 = 0;
            }
            else if (H_ >= 1 && H_ < 2) {
                R1 = X;
                G1 = C;
                B1 = 0;
            } else if (H_ >= 2 && H_ < 3) {
                R1 = 0;
                G1 = C;
                B1 = X;
            } else if (H_ >= 3 && H_ < 4) {
                R1 = 0;
                G1 = X;
                B1 = C;
            } else if (H_ >= 4 && H_ < 5) {
                R1 = X;
                G1 = 0;
                B1 = C;
            }
            else if (H_ >= 5 && H_ < 6) {
                R1 = C;
                G1 = 0;
                B1 = X;
            }
        }

        /* Find R, G, and B by adding the same amount to each component, to match lightness */

        var m = L - (C / 2);

        var r, g, b;

        /* Normalise to range [0,255] by multiplying 255 */
        r = (R1 + m) * 255;
        g = (G1 + m) * 255;
        b = (B1 + m) * 255;

        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);

        return [r,g,b];
    }

    function colorChangeLuminance(color, luminancePercent) {

        if (color.indexOf("rgb") == -1){

            color.replace("#","");

            if (color.length == 3){
                color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
            }
            color = hex2rgb(color);
        }
        color = rgb2hsl(color[0], color[1], color[2]);

        color[2] += luminancePercent/100;

        color = hsl2rgb(color[0], color[1], color[2]);

        color = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";

        color = rgb2hex(color);

        return color;
    }

    return {
        initDialog: initDialog,
        updateReader: updateReader,
        defaultSettings: defaultSettings,
        setFocusSize: setFocusSize,
        setUserInterfaceStyles: setUserInterfaceStyles
    }
});
