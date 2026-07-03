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

import com.savora.demo.payload.Dto.RecipeDto;
import com.savora.demo.service.RecipeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService recipeService;

    @GetMapping
    public List<RecipeDto> getAllRecipes() {
        return recipeService.getAllRecipes();
    }

    @GetMapping("/{id}")
    public RecipeDto getRecipe(@PathVariable String id) {
        return recipeService.getRecipeById(id);
    }

    @PostMapping
    public RecipeDto createRecipe(@RequestBody RecipeDto dto) {
        return recipeService.createRecipe(dto);
    }

    @PutMapping("/{id}")
    public RecipeDto updateRecipe(@PathVariable String id, @RequestBody RecipeDto dto) {
        return recipeService.updateRecipe(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deleteRecipe(@PathVariable String id) {
        recipeService.deleteRecipe(id);
    }
}