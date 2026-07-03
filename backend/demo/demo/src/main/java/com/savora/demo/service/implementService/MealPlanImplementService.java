package com.savora.demo.service.implementService;

import java.util.List;

import org.springframework.stereotype.Service;

import com.savora.demo.mapper.MealPlanMapper;
import com.savora.demo.modal.MealPlan;
import com.savora.demo.modal.Recipe;
import com.savora.demo.payload.Dto.MealPlanDto;
import com.savora.demo.repository.MealPlanRepository;
import com.savora.demo.repository.RecipeRepository;
import com.savora.demo.service.MealPlanService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MealPlanImplementService implements MealPlanService {
    private final MealPlanRepository mealPlanRepository;
    private final RecipeRepository recipeRepository;

    @Override
    public MealPlanDto getMealPlanById(String id) {
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));
        return MealPlanMapper.toDto(mealPlan);
    }

    @Override
    public MealPlanDto createMealPlan(MealPlanDto mealPlanDto) {
        Recipe recipe = resolveRecipe(mealPlanDto.getRecipeId());
        MealPlan mealPlan = MealPlanMapper.toEntity(mealPlanDto, recipe);
        MealPlan savedMealPlan = mealPlanRepository.save(mealPlan);
        return MealPlanMapper.toDto(savedMealPlan);
    }

    @Override
    public MealPlanDto updateMealPlan(String id, MealPlanDto mealPlanDto) {
        MealPlan mealPlan = mealPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Meal plan not found"));

        mealPlan.setDate(mealPlanDto.getDate());
        mealPlan.setMealType(mealPlanDto.getMealType());

        if (mealPlanDto.getRecipeId() != null) {
            Recipe recipe = resolveRecipe(mealPlanDto.getRecipeId());
            mealPlan.setRecipe(recipe);
            mealPlan.setRecipeName(recipe.getName());
            mealPlan.setRecipeImage(recipe.getImageUrl());
        }

        MealPlan updatedMealPlan = mealPlanRepository.save(mealPlan);
        return MealPlanMapper.toDto(updatedMealPlan);
    }

    @Override
    public void deleteMealPlan(String id) {
        mealPlanRepository.deleteById(id);
    }

    @Override
    public List<MealPlanDto> getAllMealPlans() {
        return mealPlanRepository.findAll().stream().map(MealPlanMapper::toDto).toList();
    }

    private Recipe resolveRecipe(String recipeId) {
        if (recipeId == null || recipeId.isBlank()) {
            return null;
        }
        return recipeRepository.findById(recipeId).orElseThrow(() -> new RuntimeException("Recipe not found"));
    }
}
