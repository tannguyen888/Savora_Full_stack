package com.savora.demo.service;

import java.util.List;

import com.savora.demo.payload.Dto.CommunityPostDto;

public interface CommunityPostService {
    List<CommunityPostDto> listPosts();

    CommunityPostDto createPost(CommunityPostDto dto);

    CommunityPostDto likePost(String postId);

    CommunityPostDto sharePost(String postId);
}
