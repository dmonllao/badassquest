define(function() {
    return {
        initFood: 2000,
        initHealth: 100,
        initSpeed: 4,
        initAttack: 300,
        initDefense: 5,
        levels: [0, 50, 100, 300, 700, 1500, 3000, 5000, 8000, 10000],
        levelIncrement: 1.1,
        breathDropInterval: 3000,
        breathDropAmount: 10,
        userAttackTime: 2000,
        foeAttackTime: 2000,
        chaseStartDelay: 3000,
        maxReasonableLevel: 10,
        maxChaseDuration: 15,
        maxReRouteLimit: 5,
        maxLoot: 2000,
        closePosition: 20,
        closePositionPissed: 80,
        politicLevels: {
            locality: 3,
            administrative_area_level_3: 4,
            administrative_area_level_2: 5,
            administrative_area_level_1: 6,
            country: 7
        },
        pissedEvery: 0,
        pissedAfter: 0
    };
});
