package com.example.fileservice.controller;

import com.example.fileservice.service.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 파일 컨트롤러
 * - 목적: 파일 업로드 엔드포인트 제공 (프런트/게이트웨이에서 호출)
 * - 경로: /files
 */
@RestController
@RequestMapping("/files")
public class FileController {

    private final S3Service s3Service;

    public FileController(S3Service s3Service) {
        this.s3Service = s3Service;
    }

    /**
     * 파일 업로드
     * @param file 업로드할 파일 (multipart/form-data)
     * @return 업로드된 S3 URL JSON
     */
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
