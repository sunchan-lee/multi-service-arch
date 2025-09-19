package com.example.fileservice.controller;

import com.example.fileservice.service.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileController {

    private final S3Service s3Service;

    public FileController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

@PostMapping("/upload")
public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
    try {
        String fileUrl = s3Service.uploadFile(file);
        return ResponseEntity.ok().body("{\"url\": \"" + fileUrl + "\"}");
    } catch (Exception e) {
        e.printStackTrace(); // 👈 로그 확인용
        return ResponseEntity.status(500).body("{\"error\": \"" + e.getMessage() + "\"}");
    }
}
}
