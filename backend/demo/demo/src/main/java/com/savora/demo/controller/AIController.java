package com.savora.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.savora.demo.payload.Request.GenerateRecipeRequest;
import com.savora.demo.service.Request.invokeLLM;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final invokeLLM llmInvoker;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateRecipe(@RequestBody GenerateRecipeRequest request) {
        try {
            return ResponseEntity.ok(llmInvoker.generateRecipe(request.getPrompt(), request.getFileUrls()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}