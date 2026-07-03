package com.savora.demo.service.implementService;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.savora.demo.mapper.CommunityPostMapper;
import com.savora.demo.modal.CommunityPost;
import com.savora.demo.payload.Dto.CommunityPostDto;
import com.savora.demo.repository.CommunityPostRepository;
import com.savora.demo.service.CommunityPostService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommunityPostImplementService implements CommunityPostService {

    private final CommunityPostRepository communityPostRepository;

    @Override
    public List<CommunityPostDto> listPosts() {
        return CommunityPostMapper.toDtoList(communityPostRepository.findAllByOrderByCreatedDateDesc());
    }

    @Override
    public CommunityPostDto createPost(CommunityPostDto dto) {
        if (!StringUtils.hasText(dto.getAuthorName())) {
            throw new RuntimeException("author_name is required");
        }
        if (!StringUtils.hasText(dto.getContent())) {
            throw new RuntimeException("content is required");
        }

        CommunityPost post = CommunityPostMapper.toEntity(dto);
        post.setId(UUID.randomUUID().toString());

        CommunityPost saved = communityPostRepository.save(post);
        return CommunityPostMapper.toDto(saved);
    }

    @Override
    public CommunityPostDto likePost(String postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        post.setLikeCount((post.getLikeCount() == null ? 0 : post.getLikeCount()) + 1);
        return CommunityPostMapper.toDto(communityPostRepository.save(post));
    }

    @Override
    public CommunityPostDto sharePost(String postId) {
        CommunityPost post = communityPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));
        post.setShareCount((post.getShareCount() == null ? 0 : post.getShareCount()) + 1);
        return CommunityPostMapper.toDto(communityPostRepository.save(post));
    }
}
