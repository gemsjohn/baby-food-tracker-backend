function convertNutrition(nutrition, desiredQuantity, desiredMeasurement, inDB) {
    console.log("# - CONVERT NUTRITION")
    console.log(nutrition, desiredQuantity, desiredMeasurement)

    let local_nutrition;
    if (inDB) {
        local_nutrition = nutrition;
    } else {
        local_nutrition = nutrition.nutrients;
    }

    function findConversionFactor(inputUnit) {
        const gramsPerCup = 236.588;
        const gramsPerTablespoon = 14.7868;
        const gramsPerTeaspoon = 4.92893;
        const gramsPerOunce = 28.3495;
        const gramsPerMilliliter = 1;
        const gramsPerMinute = 7.5;

        let serving = 1;
        console.log(local_nutrition)
        let weightInGrams = local_nutrition.servingWeight.amount;

        console.log("- - - - - - - - - - - ")
        console.log(desiredQuantity)
        console.log(desiredMeasurement)
        console.log()
        console.log()
        console.log(serving)
        console.log(weightInGrams)
        console.log("- - - - - - - - - - - ")


        switch (inputUnit) {
            case "cups":
                return (gramsPerCup / (serving * weightInGrams))
            case "tablespoons":
                return (gramsPerTablespoon / (serving * weightInGrams))
            case "teaspoons":
                return (gramsPerTeaspoon / (serving * weightInGrams))
            case "ounces":
                return (gramsPerOunce / (serving * weightInGrams))
            case "milliliters":
                return (gramsPerMilliliter / (serving * weightInGrams))
            case "minutes":
                return (gramsPerMinute / (serving * weightInGrams))
            default:
                return 0;
        }
    }

    let factor = findConversionFactor(desiredMeasurement.toLowerCase());
    factor = factor * desiredQuantity;
    console.log("# - FACTOR: " + factor)
    

    let calories;
    let carbohydrates;
    let fiber;
    let protein;
    let fat;
    let sugar;
    let iron;
    let zinc;
    let omega_3;
    let vitaminD;

    let iron_unit;
    let zinc_unit;
    let omega_3_unit;
    let vitaminD_unit;

    if (local_nutrition.calories) {
        calories = Math.round(local_nutrition.calories.amount * factor);
    } else {
        calories = 0;
    }
    if (local_nutrition.carbohydrates) {
        carbohydrates = Math.round(local_nutrition.carbohydrates.amount * factor);
    } else {
        carbohydrates = 0;
    }
    if (local_nutrition.fiber) {
        fiber = Math.round(local_nutrition.fiber.amount * factor);
    } else {
        fiber = 0;
    }
    if (local_nutrition.protein) {
        protein = Math.round(local_nutrition.protein.amount * factor);
    } else {
        protein = 0
    }
    if (local_nutrition.fat) {
        fat = Math.round(local_nutrition.fat.amount * factor);
    } else {
        fat = 0;
    }
    if (local_nutrition.sugar) {
        sugar = Math.round(local_nutrition.sugar.amount * factor);
    } else {
        sugar = 0;
    }
    if (local_nutrition.iron && local_nutrition.iron.unit == '%') {
        iron = Math.round(local_nutrition.iron.amount * factor);
        iron_unit = '%';
    } else {
        iron = 0;
        iron_unit = '%';
    }
    if (local_nutrition.zinc && local_nutrition.zinc.unit == '%') {
        zinc = Math.round(local_nutrition.zinc.amount * factor);
        zinc_unit = '%';
    } else {
        zinc = 0;
        zinc_unit = '%';
    }
    if (local_nutrition.omega_3 && local_nutrition.omega_3.unit == '%') {
        omega_3 = Math.round(local_nutrition.omega_3.amount * factor);
        omega_3_unit = '%';
    } else {
        omega_3 = 0;
        omega_3_unit = '%';
    }
    if (local_nutrition.vitaminD && local_nutrition.vitaminD.unit == '%') {
        vitaminD = Math.round(local_nutrition.vitaminD.amount * factor);
        vitaminD_unit = '%';
    } else {
        vitaminD = 0;
        vitaminD_unit = '%';
    }

    // Return the converted values
    return {
        "calories": { amount: calories, unit: '' },
        "carbohydrates": { amount: carbohydrates, unit: 'g' },
        "fiber": { amount: fiber, unit: 'g' },
        "protein": { amount: protein, unit: 'g' },
        "fat": { amount: fat, unit: 'g' },
        "sugar": { amount: sugar, unit: 'g' },
        "iron": { amount: iron, unit: iron_unit },
        "zinc": { amount: zinc, unit: zinc_unit },
        "omega3": { amount: omega_3, unit: omega_3_unit },
        "vitaminD": { amount: vitaminD, unit: vitaminD_unit }
    };

}

module.exports = { convertNutrition }