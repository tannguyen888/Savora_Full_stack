package com.savora.demo.mapper;

import java.util.List;

import com.savora.demo.modal.CommunityPost;
import com.savora.demo.payload.Dto.CommunityPostDto;

public class CommunityPostMapper {

    private CommunityPostMapper() {
    }

    public static CommunityPostDto toDto(CommunityPost post) {
        if (post == null) {
            return null;
        }

        return CommunityPostDto.builder()
                .id(post.getId())
                .authorName(post.getAuthorName())
                .content(post.getContent())
                .recipeId(post.getRecipeId())
                .recipeName(post.getRecipeName())
                .recipeImage(post.getRecipeImage())
                .likeCount(post.getLikeCount())
                .shareCount(post.getShareCount())
                .createdDate(post.getCreatedDate())
                .build();
    }

    public static CommunityPost toEntity(CommunityPostDto dto) {
        if (dto == null) {
            return null;
        }

        CommunityPost post = new CommunityPost();
        post.setId(dto.getId());
        post.setAuthorName(dto.getAuthorName());
        post.setContent(dto.getContent());
        post.setRecipeId(dto.getRecipeId());
        post.setRecipeName(dto.getRecipeName());
        post.setRecipeImage(dto.getRecipeImage());
        post.setLikeCount(dto.getLikeCount());
        post.setShareCount(dto.getShareCount());
        post.setCreatedDate(dto.getCreatedDate());
        return post;
    }

    public static List<CommunityPostDto> toDtoList(List<CommunityPost> posts) {
        return posts.stream().map(CommunityPostMapper::toDto).toList();
    }
}
