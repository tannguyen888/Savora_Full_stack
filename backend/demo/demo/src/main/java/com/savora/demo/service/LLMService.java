package com.savora.demo.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface LLMService {
    String uploadFile(MultipartFile file) throws IOException;
}
