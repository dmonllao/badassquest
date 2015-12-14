define(function() {
    return {
        initFood: 2000,
        initHealth: 100,
        initSpeed: 4,
        initAttack: 300,
        initDefense: 5,
        firstLevelUpExp: 50,
        levelUpAttrsIncrement: 1.1,
        poisRadius: 400,
        // Different intervals to make it more real.
        taxesInterval: 5000,
        revenuesInterval: 10000,
        breathDropInterval: 3000,
        breathDropAmount: 10,
        userAttackTime: 2000,
        foeAttackTime: 2000,
        chaseStartDelay: 3000,
        // Being firstLevelUpExp 50 this would be experience 6200 (not reliably calculated)
        maxReasonableLevel: 11,
        maxChaseDuration: 15,
        maxReRouteLimit: 5,
        maxLoot: 2000,
        picsNum: 100,
        closePosition: 20,
        closePositionPissed: 80,
        politicLevels: {
            locality: 3,
            administrative_area_level_3: 4,
            administrative_area_level_2: 5,
            administrative_area_level_1: 6,
            country: 7
        },
        passingByLapse: 5,
        passingByRampUp: 2
    };
});
