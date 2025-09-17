package com.example.fileservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

/**
 * S3 서비스
 * - 목적: AWS S3 업로드/리소스 관리 비즈니스 로직
 * - 주입: AwsConfig에서 생성한 S3Client 빈 사용
 */
@Service
public class S3Service {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * 파일 업로드
     * @param file 업로드할 파일
     * @return 퍼블릭 S3 URL
     */
    public String uploadFile(MultipartFile file) throws IOException {
        String key = "uploads/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .build(),
                software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes())
        );

        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName,
                region,
                key);
    }

    /**
     * 설정 확인용 로그 (애플리케이션 시작 시 1회)
     */
    @PostConstruct
    public void checkBucket() {
        System.out.println("🔍 Loaded bucketName from properties: " + bucketName);
    }
}
