package com.savora.demo.payload.Dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

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
public class CommunityPostDto {

    private String id;

    @JsonProperty("author_name")
    @JsonAlias({ "authorName" })
    @NotBlank(message = "author_name is required")
    private String authorName;

    @NotBlank(message = "content is required")
    private String content;

    @JsonProperty("recipe_id")
    @JsonAlias({ "recipeId" })
    private String recipeId;

    @JsonProperty("recipe_name")
    @JsonAlias({ "recipeName" })
    private String recipeName;

    @JsonProperty("recipe_image")
    @JsonAlias({ "recipeImage" })
    private String recipeImage;

    @JsonProperty("like_count")
    @JsonAlias({ "likeCount" })
    private Integer likeCount;

    @JsonProperty("share_count")
    @JsonAlias({ "shareCount" })
    private Integer shareCount;

    @JsonProperty("created_date")
    @JsonAlias({ "createdDate" })
    private LocalDateTime createdDate;
}
