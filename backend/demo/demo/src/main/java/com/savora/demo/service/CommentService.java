package com.savora.demo.service;

import java.util.List;

import com.savora.demo.payload.Dto.CommentDto;

public interface CommentService {
    List<CommentDto> getCommentsByPostId(String postId);

    CommentDto createComment(String postId, CommentDto commentDto);
}