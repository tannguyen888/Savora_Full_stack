package com.savora.demo.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.savora.demo.payload.Dto.CommentDto;
import com.savora.demo.payload.Dto.CommunityPostDto;
import com.savora.demo.service.CommentService;
import com.savora.demo.service.CommunityPostService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/community/posts")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityPostService communityPostService;
    private final CommentService commentService;

    @GetMapping
    public List<CommunityPostDto> listPosts() {
        return communityPostService.listPosts();
    }

    @PostMapping
    public CommunityPostDto createPost(@Valid @RequestBody CommunityPostDto dto) {
        return communityPostService.createPost(dto);
    }

    @PostMapping("/{postId}/like")
    public CommunityPostDto likePost(@PathVariable String postId) {
        return communityPostService.likePost(postId);
    }

    @PostMapping("/{postId}/share")
    public CommunityPostDto sharePost(@PathVariable String postId) {
        return communityPostService.sharePost(postId);
    }

    @GetMapping("/{postId}/comments")
    public List<CommentDto> listComments(@PathVariable String postId) {
        return commentService.getCommentsByPostId(postId);
    }

    @PostMapping("/{postId}/comments")
    public CommentDto createComment(@PathVariable String postId, @RequestBody CommentDto dto) {
        return commentService.createComment(postId, dto);
    }
}
