package com.savora.demo.service.implementService;

import java.util.List;

import org.springframework.stereotype.Service;

import com.savora.demo.mapper.RecipeMapper;
import com.savora.demo.modal.Recipe;
import com.savora.demo.payload.Dto.RecipeDto;
import com.savora.demo.repository.RecipeRepository;
import com.savora.demo.service.RecipeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeImplementService implements RecipeService {

    private final RecipeRepository recipeRepository;

    @Override
    public List<RecipeDto> getAllRecipes() {
        return recipeRepository.findAll().stream().map(RecipeMapper::toDto).toList();
    }

    @Override
    public RecipeDto getRecipeById(String id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        return RecipeMapper.toDto(recipe);
    }

    @Override
    public RecipeDto createRecipe(RecipeDto dto) {
        Recipe recipe = RecipeMapper.toEntity(dto);
        return RecipeMapper.toDto(recipeRepository.save(recipe));
    }

    @Override
    public RecipeDto updateRecipe(String id, RecipeDto dto) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));

        recipe.setName(dto.getName());
        recipe.setImageUrl(dto.getImageUrl());
        recipe.setDescription(dto.getDescription());
        recipe.setIngredients(dto.getIngredients());
        recipe.setSteps(dto.getSteps());
        recipe.setServings(dto.getServings());
        recipe.setPrepTime(dto.getPrepTime());
        recipe.setCookTime(dto.getCookTime());
        recipe.setCategory(dto.getCategory());
        recipe.setTags(dto.getTags());

        return RecipeMapper.toDto(recipeRepository.save(recipe));
    }

    @Override
    public void deleteRecipe(String id) {
        if (!recipeRepository.existsById(id)) {
            throw new RuntimeException("Recipe not found");
        }
        recipeRepository.deleteById(id);
    }
}