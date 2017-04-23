define(function() {
    return {
        defaultMapCenterBackground: {lat: 40.799575, lng: -73.951498},
        characterPic: 'img/trump.png',
        initFood: 4000,
        initHealth: 100,
        initWealth: 20,
        initSpeed: 4,
        initAttack: 4,
        initDefense: 5,
        firstLevelUpExp: 50,
        levelUpAttrsIncrement: 1.1,
        poisRadius: 750,
        // Different intervals to make it more real.
        taxesInterval: 5000,
        revenuesInterval: 10000,
        breathDropInterval: 3000,
        breathDropAmount: 10,
        userAttackTime: 2000,
        foeAttackTime: 2000,
        defaultFoePic: 'img/foe.png',
        chaseStartDelay: 8000,
        // Var below used to calculate foe's power.
        maxReasonableLevel: 20,
        maxChaseDuration: 15,
        maxReRouteLimit: 5,
        maxLoot: 2000,
        picsNum: 100,
        areasPositionsDistance: 600,
        closePosition: 20,
        closePositionPissed: 80,
        politicLevels: {
            locality: 2,
            administrative_area_level_3: 5,
            administrative_area_level_2: 7,
            administrative_area_level_1: 10,
            country: 15
        },
        pissedPassingByLapse: 10,
        pissedPassingByRampUp: 2,
        passingByLapse: 3000,
    };
});
