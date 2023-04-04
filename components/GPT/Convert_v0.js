// function convertNutrition(nutrition, servingSize) {
function convertNutrition(nutrition, quantity, measurement) {
    console.log("# - convertNutrition")
    function addQuotes(variable) {
        return `"${variable}"`;
    }
      
    function findConversionFactor(inputUnit) {
        const convertGrams = [
            { size: "cups", grams: "236.6", unit: "g" },
            { size: "tablespoons", grams: "14.8", unit: "g" },
            { size: "teaspoons", grams: "4.9", unit: "g" },
            { size: "ounces", grams: "28.35", unit: "g" },
            { size: "milliliters", grams: "0.001", unit: "g" },
            {size: "minutes", grams: "7.5", unit: "g" }
        ];

        const gramsPerServing = parseFloat(convertGrams.find(obj => obj.size === "cups").grams);

        switch (inputUnit) {
            case "cups":
                return gramsPerServing / 100;
            case "tablespoons":
                return parseFloat(convertGrams.find(obj => obj.size === "tablespoons").grams) / gramsPerServing;
            case "teaspoons":
                return parseFloat(convertGrams.find(obj => obj.size === "teaspoons").grams) / gramsPerServing;
            case "ounces":
                return parseFloat(convertGrams.find(obj => obj.size === "ounces").grams) / gramsPerServing;
            case "milliliters":
                return parseFloat(convertGrams.find(obj => obj.size === "milliliters").grams) / gramsPerServing;
            case "minutes":
                return parseFloat(convertGrams.find(obj => obj.size === "minutes").grams) / gramsPerServing;
            default:
                return 0;
        }
    }

    function findConversionFactor_mg(inputUnit) {
        const convertGrams = [
            { size: "cups", grams: "236.6", unit: "g" },
            { size: "tablespoons", grams: "14.8", unit: "g" },
            { size: "teaspoons", grams: "4.9", unit: "g" },
            { size: "ounces", grams: "28.35", unit: "g" },
            { size: "milliliters", grams: "0.001", unit: "g" },
            {size: "minutes", grams: "7.5", unit: "g" }
        ];

        const gramsPerServing = parseFloat(convertGrams.find(obj => obj.size === "cups").grams);

        switch (inputUnit) {
            case "cups":
                return gramsPerServing / 100;
            case "tablespoons":
                return parseFloat(convertGrams.find(obj => obj.size === "tablespoons").grams) / gramsPerServing;
            case "teaspoons":
                return parseFloat(convertGrams.find(obj => obj.size === "teaspoons").grams) / gramsPerServing;
            case "ounces":
                return parseFloat(convertGrams.find(obj => obj.size === "ounces").grams) / gramsPerServing;
            case "milliliters":
                return parseFloat(convertGrams.find(obj => obj.size === "milliliters").grams) / gramsPerServing;
            case "minutes":
                return parseFloat(convertGrams.find(obj => obj.size === "minutes").grams) / gramsPerServing;
            default:
                return 0;
        }
    }

    // console.log("# - nutrition:")
    // console.log(nutrition.calories)
    // console.log("# - quantity:")
    // console.log(quantity)
    // console.log("# - measurement:")
    // console.log(addQuotes(measurement))


    let factor = findConversionFactor(measurement.toLowerCase());
    factor = factor * quantity;

    let factor_mg = findConversionFactor_mg(measurement.toLowerCase());
    factor_mg = factor_mg * quantity;


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

    if (nutrition.calories) {
        calories = Math.round(nutrition.calories.amount * factor);
    } else {
        calories = 0;
    }
    if (nutrition.carbohydrates) {
        carbohydrates = Math.round(nutrition.carbohydrates.amount * factor);
    } else {
        carbohydrates = 0;
    }
    if (nutrition.fiber) {
        fiber = Math.round(nutrition.fiber.amount * factor);
    } else {
        fiber = 0;
    }
    if (nutrition.protein) {
        protein = Math.round(nutrition.protein.amount * factor);
    } else {
        protein = 0
    }
    if (nutrition.fat) {
        fat = Math.round(nutrition.fat.amount * factor);
    } else {
        fat = 0;
    }
    if (nutrition.sugar) {
        sugar = Math.round(nutrition.sugar.amount * factor);
    } else {
        sugar = 0;
    }
    if (nutrition.iron && nutrition.iron.unit == 'mg') {
        iron = Math.round(nutrition.iron.amount * factor_mg);
        iron_unit = 'mg';
    } else {
        iron = 0;
        iron_unit = 'mg';
    }
    if (nutrition.zinc && nutrition.zinc.unit == 'mg') {
        zinc = Math.round(nutrition.zinc.amount * factor_mg);
        zinc_unit = 'mg';
    } else {
        zinc = 0;
        zinc_unit = 'mg';
    }
    if (nutrition.omega_3 && nutrition.omega_3.unit == 'mg') {
        omega_3 = Math.round(nutrition.omega_3.amount * factor_mg);
        omega_3_unit = 'mg';
    } else {
        omega_3 = 0;
        omega_3_unit = 'mg';
    }
    if (nutrition.vitaminD && nutrition.vitaminD.unit == 'mg') {
        vitaminD = Math.round(nutrition.vitaminD.amount * factor_mg);
        vitaminD_unit = 'mg';
    } else {
        vitaminD = 0;
        vitaminD_unit = 'mg';
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



