package com.savora.demo.payload.Request;

import java.util.List;

import lombok.Data;

@Data
public class GenerateRecipeRequest {
    private String prompt;
    private List<String> fileUrls;
}