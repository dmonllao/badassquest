define(['action/Cure', 'action/Food', 'action/Steal', 'action/Hack', 'action/Fight', 'action/Extort', 'action/Buy'], function(ActionCure, ActionFood, ActionSteal, ActionHack, ActionFight, ActionExtort, ActionBuy) {

    var poiTypes = {
        hospital: 'health',
        doctor: 'health',
        shopping_mall: 'shop',
        jewelry_store: 'shop',
        electronics_store: 'shop',
        bank: 'wealth',
        atm: 'hackable',
        restaurant: 'food',
        bar: 'food',
    };

    var typeActions = {
        health: [ActionCure],
        shop: [ActionSteal, ActionExtort, ActionBuy],
        wealth: [ActionSteal, ActionFight],
        hackable: [ActionHack],
        food: [ActionFood, ActionExtort, ActionBuy],
    };

    var missionActions = {
        health: [ActionFight],
        shop: [ActionSteal, ActionExtort, ActionBuy],
        wealth: [ActionSteal, ActionFight],
        hackable: [ActionHack],
        food: [ActionExtort, ActionBuy],
    };

    /**
     * Actions available even after you bought them.
     * @type {Array}
     */
    var propertyActions = ["ActionCure", "ActionFood"];

    var missionTypes = ['bar', 'restaurant', 'bank', 'shopping_center'];

    return {
        get: function() {
            return poiTypes;
        },

        getPropertyActions: function() {
            return propertyActions;
        },

        getMissionsTypes: function() {
            return missionTypes;
        },

        getMissionLimits: function(level) {
            return {
                ActionSteal: 2 * level,
                ActionFight: 2 * level,
                ActionExtort: 2 * level,
                ActionBuy: 1 * level
            };
        },

        /**
         * Splits the available poi types list in parts.
         *
         * The idea is to balance the number of pois we get, so similar types should go together.
         */
        getSearchGroups: function() {
            // This list should be short as there is 1 place API query for each element.
            return [
                ['hospital', 'doctor', 'bank', 'atm'],
                ['restaurant', 'bar', 'jewelry_store', 'electronics_store', 'shopping_mall']
            ];
        },

        getMissionActions: function(placeTypes) {

            // Picking the first valid one.
            var poiType = null;
            for(var i = 0; i < placeTypes.length; i++) {
                if (poiTypes.hasOwnProperty(placeTypes[i])) {
                    poiType = poiTypes[placeTypes[i]];
                    break;
                }
            }

            if (poiType === null || typeof missionActions[poiType] === "undefined") {
                console.error('No place type found for placetypes ' + placeTypes.join(','));
                return [];
            }
            return missionActions[poiType];
        },

        getActions: function(placeTypes) {

            // Picking the first valid one.
            var poiType = null;
            for(var i = 0; i < placeTypes.length; i++) {
                if (poiTypes.hasOwnProperty(placeTypes[i])) {
                    poiType = poiTypes[placeTypes[i]];
                    break;
                }
            }

            if (poiType === null || typeof typeActions[poiType] === "undefined") {
                console.error('No place type found for placetypes ' + placeTypes.join(','));
                return [];
            }
            return typeActions[poiType];
        }
    }
});
