package com.example.fileservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * AWS 설정 구성 클래스
 * - 목적: S3Client 빈을 생성하고 애플리케이션 전체에서 주입하여 사용
 * - 설정: 액세스 키/시크릿/리전은 application.properties 환경변수로 관리
 */
@Configuration
public class AwsConfig {

    @Value("${aws.access-key-id}")
    private String accessKey;

    @Value("${aws.secret-access-key}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * S3 클라이언트 빈 생성
     * @return Region/자격증명이 적용된 S3Client
     */
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(accessKey, secretKey)
                        )
                )
                .build();
    }
}
