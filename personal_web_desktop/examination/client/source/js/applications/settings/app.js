"use strict";

/**
 * This is the main settings function. This creates a the settings application inside the container.
 * @param container The HTML element the application is created in.
 */
function settings(container) {
    var form;
    var inputs;
    var template;

    template = document.querySelector("#settingsTemplate");
    form = document.importNode(template.content.firstElementChild, true);
    inputs = form.querySelectorAll("input");

    container.appendChild(form);

    fillFormWithData();

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        apply();
    });

    form.addEventListener("change", function() {
        inputs[5].disabled = false;
        inputs[6].disabled = false;
    });

    inputs[5].addEventListener("click", function() {
        apply();
    });

    inputs[6].addEventListener("click", function() {
        fillFormWithData();
    });

    inputs[7].addEventListener("click", function() {
        resetToDefault();
    });

    /**
     * Takes the settings saved in the local storage and fills the form with that information. Is used when the
     * application is launched and when we want to reset settings instead of applying.
     */
    function fillFormWithData() {
        var settings = JSON.parse(localStorage.getItem("PWDSettings"));

        inputs[0].value = settings.wallpaper;

        if (settings.hideDock === "true") {
            inputs[1].checked = true;
        } else {
            inputs[2].checked = true;
        }

        if (settings.dockPosition === "top") {
            inputs[3].checked = true;
        } else {
            inputs[4].checked = true;
        }

        inputs[5].disabled = true;
        inputs[6].disabled = true;
    }

    /**
     * This creates an object and fills it with the data from the form and puts it in the local storage. useSettings
     * is then called to put the settings to use.
     */
    function apply() {
        var newSetting = {
            wallpaper: inputs[0].value,
            hideDock: inputs[1].checked ? "true" : "false",
            dockPosition: inputs[3].checked ? "top" : "bottom"
        };
        localStorage.setItem("PWDSettings", JSON.stringify(newSetting));
        useSettings();
    }

    /**
     * Is used when we want to return to our default settings. It loads settings from defaultSettings.json and puts it
     * in the local storage. fillFormWithData is then used to fill the form, and useSettings to use our new settings.
     */
    function resetToDefault() {
        localStorage.setItem("PWDSettings", JSON.stringify(require("../../defaultSettings.json")));
        fillFormWithData();
        useSettings();
    }

    /**
     * useSettings is when we want our settings to be changed visually in the application. It takes the settings out of
     * local storage and then depending on the values of the objects members different settings is set.
     */
    function useSettings() {
        var i;
        var settings = JSON.parse(localStorage.getItem("PWDSettings"));
        var buttons;

        //Set wallpaper
        document.querySelector("body").style.backgroundImage = "url(" + settings.wallpaper + ")";

        //Hide/Show Dock
        if (settings.hideDock === "false") {
            document.querySelector("#dock").style.height = "60px";
            buttons = document.querySelector("#dock").children;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "50px";
            }
        } else {
            document.querySelector("#dock").style.height = "0px";
            buttons = document.querySelector("#dock").children;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "0px";
            }
        }

        //Dock Position
        if (settings.dockPosition === "top") {
            document.querySelector("#dock").className = "dockTop";
        } else {
            document.querySelector("#dock").className = "dockBottom";
        }
    }
}

module.exports.launch = settings;
