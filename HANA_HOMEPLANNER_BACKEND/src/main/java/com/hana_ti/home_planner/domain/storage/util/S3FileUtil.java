package com.hana_ti.home_planner.domain.storage.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Slf4j
@Component
public class S3FileUtil {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    /**
     * 청약홈 데이터 파일 경로 생성
     */
    public String generateApplyHomeFilePath(String fileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("applyhome/%s/%s", timestamp, fileName);
    }

    /**
     * 대출 관련 파일 경로 생성
     */
    public String generateLoanFilePath(String fileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("loans/%s/%s", timestamp, fileName);
    }

    /**
     * 사용자 문서 파일 경로 생성
     */
    public String generateUserDocumentFilePath(String userId, String fileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        return String.format("users/%s/documents/%s/%s", userId, timestamp, fileName);
    }

    /**
     * 고유한 파일명 생성
     */
    public String generateUniqueFileName(String originalFileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(originalFileName);
        String baseName = getFileNameWithoutExtension(originalFileName);
        
        return String.format("%s_%s_%s%s", baseName, timestamp, uniqueId, extension);
    }

    /**
     * 파일 확장자 추출
     */
    public String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
    }

    /**
     * 확장자 제외한 파일명 추출
     */
    public String getFileNameWithoutExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    }

    /**
     * 파일 크기 포맷팅 (바이트 → 읽기 쉬운 형태)
     */
    public String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024) return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    /**
     * 허용된 파일 확장자 확인
     */
    public boolean isAllowedFileType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        String[] allowedExtensions = {".csv", ".xlsx", ".xls", ".pdf", ".txt", ".json", ".xml"};
        
        for (String allowedExt : allowedExtensions) {
            if (extension.equals(allowedExt)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 파일 타입별 MIME 타입 반환
     */
    public String getMimeType(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        
        return switch (extension) {
            case ".csv" -> "text/csv";
            case ".xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case ".xls" -> "application/vnd.ms-excel";
            case ".pdf" -> "application/pdf";
            case ".txt" -> "text/plain";
            case ".json" -> "application/json";
            case ".xml" -> "application/xml";
            default -> "application/octet-stream";
        };
    }

    /**
     * S3 파일 URL 생성
     */
    public String generateS3Url(String objectKey) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);
    }

    /**
     * 파일 업로드 로깅
     */
    public void logFileUpload(String fileName, String objectKey, long fileSize) {
        log.info("파일 업로드 완료 - 원본파일명: {}, S3경로: {}, 파일크기: {}", 
                fileName, objectKey, formatFileSize(fileSize));
    }

    /**
     * 파일 다운로드 로깅
     */
    public void logFileDownload(String objectKey) {
        log.info("파일 다운로드 완료 - S3경로: {}", objectKey);
    }

    /**
     * 파일 삭제 로깅
     */
    public void logFileDelete(String objectKey) {
        log.info("파일 삭제 완료 - S3경로: {}", objectKey);
    }
}
