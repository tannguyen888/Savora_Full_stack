package com.savora.demo.payload.Dto;

import java.time.LocalDateTime;
import java.util.List;

import com.savora.demo.domain.Category;

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
public class RecipeDto {

    private String id;

    private String name;

    private String imageUrl;

    private String description;

    private List<String> ingredients;

    private List<String> steps;

    private Integer servings;

    private Integer prepTime;

    private Integer cookTime;

    private Category category;

    private List<String> tags;

    private String createdById;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;
}