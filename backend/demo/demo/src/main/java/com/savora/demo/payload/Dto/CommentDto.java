package com.savora.demo.payload.Dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {

    private String id;

    @JsonProperty("author_name")
    @JsonAlias({ "authorName" })
    private String authorName;

    private String content;

    @JsonProperty("post_id")
    @JsonAlias({ "postId" })
    private String postId;

    @JsonProperty("created_date")
    @JsonAlias({ "createdDate" })
    private LocalDateTime createdDate;

}
