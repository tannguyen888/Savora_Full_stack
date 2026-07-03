package com.savora.demo.mapper;

import com.savora.demo.modal.Recipe;
import com.savora.demo.payload.Dto.RecipeDto;

public final class RecipeMapper {
    private RecipeMapper() {
    }

    public static RecipeDto toDto(Recipe recipe) {
        if (recipe == null) {
            return null;
        }

        return RecipeDto.builder()
                .id(recipe.getId())
                .name(recipe.getName())
                .imageUrl(recipe.getImageUrl())
                .description(recipe.getDescription())
                .ingredients(recipe.getIngredients())
                .steps(recipe.getSteps())
                .servings(recipe.getServings())
                .prepTime(recipe.getPrepTime())
                .cookTime(recipe.getCookTime())
                .category(recipe.getCategory())
                .tags(recipe.getTags())
                .createdById(recipe.getCreatedById())
                .createdDate(recipe.getCreatedDate())
                .updatedDate(recipe.getUpdatedDate())
                .build();
    }

    public static Recipe toEntity(RecipeDto recipeDto) {
        if (recipeDto == null) {
            return null;
        }

        return Recipe.builder()
                .id(recipeDto.getId())
                .name(recipeDto.getName())
                .imageUrl(recipeDto.getImageUrl())
                .description(recipeDto.getDescription())
                .ingredients(recipeDto.getIngredients())
                .steps(recipeDto.getSteps())
                .servings(recipeDto.getServings())
                .prepTime(recipeDto.getPrepTime())
                .cookTime(recipeDto.getCookTime())
                .category(recipeDto.getCategory())
                .tags(recipeDto.getTags())
                .createdById(recipeDto.getCreatedById())
                .build();
    }
}
