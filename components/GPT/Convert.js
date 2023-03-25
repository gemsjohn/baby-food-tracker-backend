// function convertNutrition(nutrition, servingSize) {
function convertNutrition(nutrition, quantity, measurement) {
    function addQuotes(variable) {
        return `"${variable}"`;
    }
      
    function findConversionFactor(inputUnit) {
        const convertGrams = [
            { size: "cups", grams: "236.6", unit: "g" },
            { size: "tablespoons", grams: "14.8", unit: "g" },
            { size: "teaspoons", grams: "4.9", unit: "g" },
            { size: "ounces", grams: "28.35", unit: "g" },
            { size: "milliliter", grams: "0.001", unit: "g" }
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
            case "milliliter":
                return parseFloat(convertGrams.find(obj => obj.size === "milliliter").grams) / gramsPerServing;
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
    if (nutrition.iron) {
        iron = Math.round(nutrition.iron.amount * factor);
    } else {
        iron = 0
    }
    if (nutrition.zinc) {
        zinc = Math.round(nutrition.zinc.amount * factor);
    } else {
        zinc = 0;
    }
    if (nutrition.omega_3) {
        omega_3 = Math.round(nutrition.omega_3.amount * factor);
    } else {
        omega_3 = 0;
    }
    if (nutrition.vitaminD) {
        vitaminD = Math.round(nutrition.vitaminD.amount * factor);
    } else {
        vitaminD = 0;
    }

    // Return the converted values
    return {
        "calories": { amount: calories, unit: '' },
        "carbohydrates": { amount: carbohydrates, unit: 'g' },
        "fiber": { amount: fiber, unit: 'g' },
        "protein": { amount: protein, unit: 'g' },
        "fat": { amount: fat, unit: 'g' },
        "sugar": { amount: sugar, unit: 'g' },
        // "iron": { amount: iron, unit: nutrition.iron.unit ||  'g' },
        // "zinc": { amount: zinc, unit: nutrition.zinc.unit ||  'g' },
        // "omega3": { amount: omega_3, unit: 'g' },
        // "vitaminD": { amount: vitaminD, unit: 'g' }

    };
}

module.exports = { convertNutrition }



