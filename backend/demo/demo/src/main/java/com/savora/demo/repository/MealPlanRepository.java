package com.savora.demo.repository;

import com.savora.demo.domain.MealType;
import com.savora.demo.modal.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MealPlanRepository extends JpaRepository<MealPlan, String> {

    List<MealPlan> findByDate(LocalDate date);

    List<MealPlan> findByDateBetween(
            LocalDate startDate,
            LocalDate endDate);

    List<MealPlan> findByMealType(MealType mealType);
}