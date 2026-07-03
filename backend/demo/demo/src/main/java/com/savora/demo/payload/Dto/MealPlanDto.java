package com.savora.demo.payload.Dto;

import java.time.LocalDate;

import com.savora.demo.domain.MealType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlanDto {

    private String id;
    private LocalDate date;
    private MealType mealType;
    private String recipeId;
    private String recipeName;
    private String recipeImage;
    private String createdById;
}