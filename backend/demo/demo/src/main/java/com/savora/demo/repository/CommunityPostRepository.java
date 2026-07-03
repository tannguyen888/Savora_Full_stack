package com.savora.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.savora.demo.modal.CommunityPost;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, String> {
    List<CommunityPost> findAllByOrderByCreatedDateDesc();
}
