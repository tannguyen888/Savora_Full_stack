package com.savora.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.savora.demo.modal.Comment;

public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByPostIdOrderByCreatedDateAsc(String postId);

}
