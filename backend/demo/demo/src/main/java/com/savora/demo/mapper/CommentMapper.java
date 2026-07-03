package com.savora.demo.mapper;

import com.savora.demo.modal.Comment;
import com.savora.demo.payload.Dto.CommentDto;

import java.util.List;
import java.util.stream.Collectors;

public class CommentMapper {

    // Entity -> DTO
    public static CommentDto toDto(Comment comment) {
        if (comment == null) {
            return null;
        }

        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setPostId(comment.getPostId());
        dto.setAuthorName(comment.getAuthorName());
        dto.setContent(comment.getContent());
        dto.setCreatedDate(comment.getCreatedDate());

        return dto;
    }

    // DTO -> Entity
    public static Comment toEntity(CommentDto dto) {
        if (dto == null) {
            return null;
        }

        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setPostId(dto.getPostId());
        comment.setAuthorName(dto.getAuthorName());
        comment.setContent(dto.getContent());
        // createdDate is set by @PrePersist

        return comment;
    }

    // List<Entity> -> List<DTO>
    public static List<CommentDto> toDtoList(List<Comment> comments) {
        return comments.stream()
                .map(CommentMapper::toDto)
                .collect(Collectors.toList());
    }
}