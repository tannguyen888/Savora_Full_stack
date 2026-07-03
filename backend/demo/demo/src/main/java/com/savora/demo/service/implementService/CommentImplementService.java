package com.savora.demo.service.implementService;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.savora.demo.mapper.CommentMapper;
import com.savora.demo.modal.Comment;
import com.savora.demo.payload.Dto.CommentDto;
import com.savora.demo.repository.CommentRepository;
import com.savora.demo.service.CommentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentImplementService implements CommentService {
    private final CommentRepository commentRepository;

    @Override
    public List<CommentDto> getCommentsByPostId(String postId) {
        return CommentMapper.toDtoList(commentRepository.findByPostIdOrderByCreatedDateAsc(postId));
    }

    @Override
    public CommentDto createComment(String postId, CommentDto commentDto) {
        Comment comment = new Comment();
        comment.setId(UUID.randomUUID().toString());
        comment.setPostId(postId);
        comment.setAuthorName(commentDto.getAuthorName());
        comment.setContent(commentDto.getContent());
        return CommentMapper.toDto(commentRepository.save(comment));
    }
}
