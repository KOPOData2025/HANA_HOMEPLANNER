package com.hana_ti.home_planner.domain.storage.service;

import com.hana_ti.home_planner.global.config.S3Properties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.core.ResponseInputStream;

import java.io.File;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3StorageService {

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    /**
     * 로컬 파일을 S3에 업로드
     */
    public String uploadFile(File localFile, String folderPath) {
        try {
            String objectKey = generateObjectKey(folderPath, localFile.getName());
            
            log.info("S3 파일 업로드 시작 - 로컬파일: {}, S3경로: {}", localFile.getName(), objectKey);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Properties.getBucketName())
                    .key(objectKey)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromFile(localFile));

            log.info("S3 파일 업로드 완료 - 경로: {}", objectKey);
            return objectKey;
        } catch (Exception e) {
            log.error("S3 파일 업로드 실패 - 파일: {}, 오류: {}", localFile.getName(), e.getMessage());
            throw new RuntimeException("파일 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * InputStream을 S3에 업로드
     */
    public String uploadFile(InputStream inputStream, String fileName, String folderPath) {
        try {
            String objectKey = generateObjectKey(folderPath, fileName);
            
            log.info("S3 파일 업로드 시작 - 파일명: {}, S3경로: {}", fileName, objectKey);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(s3Properties.getBucketName())
                    .key(objectKey)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, inputStream.available()));

            log.info("S3 파일 업로드 완료 - 경로: {}", objectKey);
            return objectKey;
        } catch (Exception e) {
            log.error("S3 파일 업로드 실패 - 파일명: {}, 오류: {}", fileName, e.getMessage());
            throw new RuntimeException("파일 업로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * S3에서 파일 다운로드
     */
    public InputStream downloadFile(String objectKey) {
        try {
            log.info("S3 파일 다운로드 시작 - 경로: {}", objectKey);

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(s3Properties.getBucketName())
                    .key(objectKey)
                    .build();

            ResponseInputStream<GetObjectResponse> responseInputStream = s3Client.getObject(getObjectRequest);
            
            log.info("S3 파일 다운로드 완료 - 경로: {}", objectKey);
            return responseInputStream;
        } catch (Exception e) {
            log.error("S3 파일 다운로드 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            throw new RuntimeException("파일 다운로드에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * S3에서 파일 삭제
     */
    public void deleteFile(String objectKey) {
        try {
            log.info("S3 파일 삭제 시작 - 경로: {}", objectKey);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(s3Properties.getBucketName())
                    .key(objectKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            
            log.info("S3 파일 삭제 완료 - 경로: {}", objectKey);
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            throw new RuntimeException("파일 삭제에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 폴더 내 파일 목록 조회
     */
    public List<String> listFiles(String folderPath) {
        try {
            log.info("S3 폴더 파일 목록 조회 - 폴더: {}", folderPath);

            ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucketName())
                    .prefix(folderPath + "/")
                    .build();

            ListObjectsV2Response response = s3Client.listObjectsV2(listObjectsRequest);
            
            List<String> fileKeys = response.contents().stream()
                    .map(S3Object::key)
                    .toList();

            log.info("S3 폴더 파일 목록 조회 완료 - 파일 수: {}", fileKeys.size());
            return fileKeys;
        } catch (Exception e) {
            log.error("S3 폴더 파일 목록 조회 실패 - 폴더: {}, 오류: {}", folderPath, e.getMessage());
            throw new RuntimeException("파일 목록 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    public boolean fileExists(String objectKey) {
        try {
            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(s3Properties.getBucketName())
                    .key(objectKey)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            log.error("S3 파일 존재 여부 확인 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            throw new RuntimeException("파일 존재 여부 확인에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * pdfs 폴더에서 경로명으로 PDF 파일 찾기
     */
    public String findPdfFileByPath(String pathName) {
        try {
            log.info("pdfs 폴더에서 PDF 파일 검색 - 경로명: {}", pathName);

            ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucketName())
                    .prefix("pdfs/")
                    .build();

            ListObjectsV2Response response = s3Client.listObjectsV2(listObjectsRequest);
            
            // 경로명과 일치하는 PDF 파일 찾기
            for (S3Object s3Object : response.contents()) {
                String objectKey = s3Object.key();
                String fileName = getFileNameFromObjectKey(objectKey);
                
                // 파일명에서 확장자 제거하고 경로명과 비교
                String fileNameWithoutExt = getFileNameWithoutExtension(fileName);
                
                if (fileNameWithoutExt.equals(pathName) && fileName.toLowerCase().endsWith(".pdf")) {
                    log.info("PDF 파일 발견 - 경로명: {}, 파일: {}", pathName, objectKey);
                    return objectKey;
                }
            }
            
            log.warn("PDF 파일을 찾을 수 없음 - 경로명: {}", pathName);
            return null;
        } catch (Exception e) {
            log.error("PDF 파일 검색 실패 - 경로명: {}, 오류: {}", pathName, e.getMessage());
            throw new RuntimeException("PDF 파일 검색에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * pdfs 폴더에서 모든 PDF 파일 목록 조회
     */
    public List<String> getAllPdfFiles() {
        try {
            log.info("pdfs 폴더에서 모든 PDF 파일 목록 조회");

            ListObjectsV2Request listObjectsRequest = ListObjectsV2Request.builder()
                    .bucket(s3Properties.getBucketName())
                    .prefix("pdfs/")
                    .build();

            ListObjectsV2Response response = s3Client.listObjectsV2(listObjectsRequest);
            
            List<String> pdfFiles = response.contents().stream()
                    .map(S3Object::key)
                    .filter(key -> key.toLowerCase().endsWith(".pdf"))
                    .collect(Collectors.toList());
            
            log.info("PDF 파일 목록 조회 완료 - 파일 수: {}", pdfFiles.size());
            return pdfFiles;
        } catch (Exception e) {
            log.error("PDF 파일 목록 조회 실패 - 오류: {}", e.getMessage());
            throw new RuntimeException("PDF 파일 목록 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 파일 URL 생성 (공개 읽기 권한이 있는 경우)
     */
    public String generateFileUrl(String objectKey) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", 
                s3Properties.getBucketName(), 
                s3Properties.getRegion(), 
                objectKey);
    }

    /**
     * 고유한 객체 키 생성
     */
    private String generateObjectKey(String folderPath, String fileName) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String extension = getFileExtension(fileName);
        String baseName = getFileNameWithoutExtension(fileName);
        
        return String.format("%s/%s_%s_%s%s", 
                folderPath, baseName, timestamp, uniqueId, extension);
    }

    /**
     * 파일 확장자 추출
     */
    private String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : "";
    }

    /**
     * 확장자 제외한 파일명 추출
     */
    private String getFileNameWithoutExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        return lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
    }

    /**
     * 객체 키에서 파일명 추출
     */
    private String getFileNameFromObjectKey(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) {
            return "unknown";
        }
        
        int lastSlashIndex = objectKey.lastIndexOf('/');
        if (lastSlashIndex == -1) {
            return objectKey;
        }
        
        return objectKey.substring(lastSlashIndex + 1);
    }
}
