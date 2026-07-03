package com.savora.demo.modal;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "community_posts")
@NoArgsConstructor
public class CommunityPost {

    @Id
    private String id;

    @Column(nullable = false)
    private String authorName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private String recipeId;

    private String recipeName;

    private String recipeImage;

    @Column(nullable = false)
    private Integer likeCount;

    @Column(nullable = false)
    private Integer shareCount;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    protected void onCreate() {
        if (this.likeCount == null) {
            this.likeCount = 0;
        }
        if (this.shareCount == null) {
            this.shareCount = 0;
        }
        if (this.createdDate == null) {
            this.createdDate = LocalDateTime.now();
        }
    }
}
