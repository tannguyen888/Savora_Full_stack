package com.savora.demo.mapper;

import com.savora.demo.modal.MealPlan;
import com.savora.demo.modal.Recipe;
import com.savora.demo.payload.Dto.MealPlanDto;

public final class MealPlanMapper {
    private MealPlanMapper() {
    }

    public static MealPlanDto toDto(MealPlan mealPlan) {
        if (mealPlan == null) {
            return null;
        }

        return MealPlanDto.builder()
                .id(mealPlan.getId())
                .date(mealPlan.getDate())
                .mealType(mealPlan.getMealType())
                .recipeId(mealPlan.getRecipe() != null ? mealPlan.getRecipe().getId() : null)
                .recipeName(mealPlan.getRecipeName())
                .recipeImage(mealPlan.getRecipeImage())
                .createdById(mealPlan.getCreatedById())
                .build();
    }

    public static MealPlan toEntity(MealPlanDto mealPlanDto, Recipe recipe) {
        if (mealPlanDto == null) {
            return null;
        }

        return MealPlan.builder()
                .id(mealPlanDto.getId())
                .date(mealPlanDto.getDate())
                .mealType(mealPlanDto.getMealType())
                .recipe(recipe)
                .recipeName(recipe != null ? recipe.getName() : mealPlanDto.getRecipeName())
                .recipeImage(recipe != null ? recipe.getImageUrl() : mealPlanDto.getRecipeImage())
                .createdById(mealPlanDto.getCreatedById())
                .build();
    }
}
