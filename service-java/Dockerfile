# Java 17 JDK slim 버전 사용 (alpine 대신)
FROM eclipse-temurin:17-jdk

# 작업 디렉토리 설정
WORKDIR /app

# 소스 복사
COPY . .

# Maven Wrapper로 빌드 (테스트는 건너뜀)
RUN ./mvnw clean package -DskipTests

# Spring Boot 애플리케이션 실행
CMD ["java", "-jar", "target/fileservice-1.0.0.jar"]
