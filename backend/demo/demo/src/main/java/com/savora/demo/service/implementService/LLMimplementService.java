package com.savora.demo.service.implementService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.savora.demo.service.LLMService;

@Service
public class LLMimplementService implements LLMService {
    private static final String UPLOAD_DIR = "uploads";

    @Override
    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path directory = Paths.get(UPLOAD_DIR);
        Files.createDirectories(directory);
        Path filePath = directory.resolve(fileName);
        Files.write(filePath, file.getBytes());
        return "/uploads/" + fileName;
    }
}
