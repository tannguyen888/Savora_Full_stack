package com.savora.demo.service;

import java.util.List;

import com.savora.demo.payload.Dto.RecipeDto;

public interface RecipeService {
    List<RecipeDto> getAllRecipes();

    RecipeDto getRecipeById(String id);

    RecipeDto createRecipe(RecipeDto recipeDto);

    RecipeDto updateRecipe(String id, RecipeDto recipeDto);

    void deleteRecipe(String id);
}
