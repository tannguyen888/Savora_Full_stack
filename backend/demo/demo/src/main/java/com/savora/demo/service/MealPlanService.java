package com.savora.demo.service;

import java.util.List;

import com.savora.demo.payload.Dto.MealPlanDto;

public interface MealPlanService {
    MealPlanDto getMealPlanById(String id);

    MealPlanDto createMealPlan(MealPlanDto mealPlanDto);

    MealPlanDto updateMealPlan(String id, MealPlanDto mealPlanDto);

    void deleteMealPlan(String id);

    List<MealPlanDto> getAllMealPlans();
}
