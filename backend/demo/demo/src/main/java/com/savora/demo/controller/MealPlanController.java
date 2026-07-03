package com.savora.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.savora.demo.payload.Dto.MealPlanDto;
import com.savora.demo.service.MealPlanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/meal-plans")
@RequiredArgsConstructor
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @GetMapping
    public List<MealPlanDto> getAllMealPlans() {
        return mealPlanService.getAllMealPlans();
    }

    @GetMapping("/{id}")
    public MealPlanDto getMealPlan(@PathVariable String id) {
        return mealPlanService.getMealPlanById(id);
    }

    @PostMapping
    public MealPlanDto createMealPlan(@RequestBody MealPlanDto mealPlanDto) {
        return mealPlanService.createMealPlan(mealPlanDto);
    }

    @PutMapping("/{id}")
    public MealPlanDto updateMealPlan(@PathVariable String id, @RequestBody MealPlanDto mealPlanDto) {
        return mealPlanService.updateMealPlan(id, mealPlanDto);
    }

    @DeleteMapping("/{id}")
    public void deleteMealPlan(@PathVariable String id) {
        mealPlanService.deleteMealPlan(id);
    }
}