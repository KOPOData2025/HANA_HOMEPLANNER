package com.hana_ti.home_planner.domain.storage.controller;

import com.hana_ti.home_planner.domain.storage.service.S3StorageService;
import com.hana_ti.home_planner.domain.applyhome.service.ApplyHomeService;
import com.hana_ti.home_planner.domain.applyhome.model.ApplyHomeData;
import com.hana_ti.home_planner.global.dto.ApiResponse;
import com.hana_ti.home_planner.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;
import java.io.InputStream;

@RestController
@RequestMapping("/api/storage")
@RequiredArgsConstructor
@Slf4j
public class S3StorageController {

    private final S3StorageService s3StorageService;
    private final ApplyHomeService applyHomeService;
    private final JwtUtil jwtUtil;

    /**
     * 파일 업로드 (MultipartFile)
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        
        log.info("파일 업로드 API 호출 - 파일명: {}, 폴더: {}", file.getOriginalFilename(), folder);

        try {
            String objectKey = s3StorageService.uploadFile(file.getInputStream(), file.getOriginalFilename(), folder);
            String fileUrl = s3StorageService.generateFileUrl(objectKey);

            Map<String, String> result = new HashMap<>();
            result.put("objectKey", objectKey);
            result.put("fileUrl", fileUrl);
            result.put("fileName", file.getOriginalFilename());

            return ResponseEntity.ok(ApiResponse.success("파일 업로드가 완료되었습니다.", result));
        } catch (Exception e) {
            log.error("파일 업로드 실패 - 파일명: {}, 오류: {}", file.getOriginalFilename(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일 업로드에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 파일 다운로드
     */
    @GetMapping("/download/{objectKey:.+}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String objectKey) {
        log.info("파일 다운로드 API 호출 - 경로: {}", objectKey);

        try {
            InputStream inputStream = s3StorageService.downloadFile(objectKey);
            byte[] fileContent = inputStream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", getFileNameFromObjectKey(objectKey));

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("파일 다운로드 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 파일 삭제
     */
    @DeleteMapping("/delete/{objectKey:.+}")
    public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable String objectKey) {
        log.info("파일 삭제 API 호출 - 경로: {}", objectKey);

        try {
            s3StorageService.deleteFile(objectKey);
            return ResponseEntity.ok(ApiResponse.success("파일이 삭제되었습니다.", objectKey));
        } catch (Exception e) {
            log.error("파일 삭제 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일 삭제에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 폴더 내 파일 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<String>>> listFiles(@RequestParam String folder) {
        log.info("파일 목록 조회 API 호출 - 폴더: {}", folder);

        try {
            List<String> files = s3StorageService.listFiles(folder);
            return ResponseEntity.ok(ApiResponse.success("파일 목록을 조회했습니다.", files));
        } catch (Exception e) {
            log.error("파일 목록 조회 실패 - 폴더: {}, 오류: {}", folder, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    @GetMapping("/exists/{objectKey:.+}")
    public ResponseEntity<ApiResponse<Boolean>> fileExists(@PathVariable String objectKey) {
        log.info("파일 존재 여부 확인 API 호출 - 경로: {}", objectKey);

        try {
            boolean exists = s3StorageService.fileExists(objectKey);
            return ResponseEntity.ok(ApiResponse.success("파일 존재 여부를 확인했습니다.", exists));
        } catch (Exception e) {
            log.error("파일 존재 여부 확인 실패 - 경로: {}, 오류: {}", objectKey, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("파일 존재 여부 확인에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * pdfs 폴더에서 경로명으로 PDF 파일 다운로드 (브라우저에서 보기)
     */
    @GetMapping("/pdf/{pathName}")
    public ResponseEntity<byte[]> downloadPdfFileByPath(@PathVariable String pathName) {
        log.info("S3 PDF 파일 다운로드 API 호출 - 경로명: {}", pathName);

        try {
            // pdfs 폴더에서 경로명으로 파일 찾기
            String objectKey = s3StorageService.findPdfFileByPath(pathName);
            if (objectKey == null) {
                log.warn("PDF 파일을 찾을 수 없음 - 경로명: {}", pathName);
                return ResponseEntity.notFound().build();
            }

            InputStream inputStream = s3StorageService.downloadFile(objectKey);
            byte[] fileContent = inputStream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", getFileNameFromObjectKey(objectKey));
            headers.setContentLength(fileContent.length);

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("S3 PDF 파일 다운로드 실패 - 경로명: {}, 오류: {}", pathName, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * pdfs 폴더에서 경로명으로 PDF 파일 다운로드 (강제 다운로드)
     */
    @GetMapping("/pdf/download/{pathName}")
    public ResponseEntity<byte[]> downloadPdfFileAsAttachmentByPath(@PathVariable String pathName) {
        log.info("S3 PDF 파일 강제 다운로드 API 호출 - 경로명: {}", pathName);

        try {
            // pdfs 폴더에서 경로명으로 파일 찾기
            String objectKey = s3StorageService.findPdfFileByPath(pathName);
            if (objectKey == null) {
                log.warn("PDF 파일을 찾을 수 없음 - 경로명: {}", pathName);
                return ResponseEntity.notFound().build();
            }

            InputStream inputStream = s3StorageService.downloadFile(objectKey);
            byte[] fileContent = inputStream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", getFileNameFromObjectKey(objectKey));
            headers.setContentLength(fileContent.length);

            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("S3 PDF 파일 강제 다운로드 실패 - 경로명: {}, 오류: {}", pathName, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * pdfs 폴더에서 모든 PDF 파일 목록 조회
     */
    @GetMapping("/pdfs")
    public ResponseEntity<ApiResponse<List<String>>> getAllPdfFiles() {
        log.info("S3 PDF 파일 목록 조회 API 호출");

        try {
            List<String> pdfFiles = s3StorageService.getAllPdfFiles();
            return ResponseEntity.ok(ApiResponse.success("PDF 파일 목록을 조회했습니다.", pdfFiles));
        } catch (Exception e) {
            log.error("S3 PDF 파일 목록 조회 실패 - 오류: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("PDF 파일 목록 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * MongoDB의 s3_pdf_urls를 사용해서 PDF 다운로드
     */
    @GetMapping("/pdf/url/{applyHomeId}")
    public ResponseEntity<byte[]> downloadPdfByUrl(
            @PathVariable String applyHomeId,
            @RequestHeader("Authorization") String authorization) {
        log.info("MongoDB s3_pdf_urls를 통한 PDF 다운로드 API 호출 - ApplyHome ID: {}", applyHomeId);

        try {
            // JWT 토큰 검증
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                log.warn("유효하지 않은 JWT 토큰 - ApplyHome ID: {}", applyHomeId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // MongoDB에서 ApplyHomeData 조회
            Optional<ApplyHomeData> applyHomeDataOpt = applyHomeService.getApplyHomeDataById(applyHomeId);
            if (applyHomeDataOpt.isEmpty()) {
                log.warn("ApplyHomeData를 찾을 수 없음 - ID: {}", applyHomeId);
                return ResponseEntity.notFound().build();
            }

            ApplyHomeData applyHomeData = applyHomeDataOpt.get();
            List<String> s3PdfUrls = applyHomeData.getS3PdfUrls();

            if (s3PdfUrls == null || s3PdfUrls.isEmpty()) {
                log.warn("s3_pdf_urls가 비어있음 - ID: {}", applyHomeId);
                return ResponseEntity.notFound().build();
            }

            // 첫 번째 PDF URL 사용
            String pdfUrl = s3PdfUrls.get(0);
            log.info("PDF URL 발견 - URL: {}, 사용자: {}", pdfUrl, userId);

            // URL에서 object key 추출
            String objectKey = extractObjectKeyFromUrl(pdfUrl);
            if (objectKey == null) {
                log.warn("URL에서 object key를 추출할 수 없음 - URL: {}", pdfUrl);
                return ResponseEntity.notFound().build();
            }

            // S3에서 파일 다운로드
            InputStream inputStream = s3StorageService.downloadFile(objectKey);
            byte[] fileContent = inputStream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", getFileNameFromObjectKey(objectKey));
            headers.setContentLength(fileContent.length);

            log.info("PDF 다운로드 성공 - 파일명: {}, 사용자: {}", getFileNameFromObjectKey(objectKey), userId);
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("MongoDB s3_pdf_urls를 통한 PDF 다운로드 실패 - ID: {}, 오류: {}", applyHomeId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * MongoDB의 s3_pdf_urls를 사용해서 PDF 강제 다운로드
     */
    @GetMapping("/pdf/url/download/{applyHomeId}")
    public ResponseEntity<byte[]> downloadPdfByUrlAsAttachment(
            @PathVariable String applyHomeId,
            @RequestHeader("Authorization") String authorization) {
        log.info("MongoDB s3_pdf_urls를 통한 PDF 강제 다운로드 API 호출 - ApplyHome ID: {}", applyHomeId);

        try {
            // JWT 토큰 검증
            String userId = extractUserIdFromToken(authorization);
            if (userId == null) {
                log.warn("유효하지 않은 JWT 토큰 - ApplyHome ID: {}", applyHomeId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            // MongoDB에서 ApplyHomeData 조회
            Optional<ApplyHomeData> applyHomeDataOpt = applyHomeService.getApplyHomeDataById(applyHomeId);
            if (applyHomeDataOpt.isEmpty()) {
                log.warn("ApplyHomeData를 찾을 수 없음 - ID: {}", applyHomeId);
                return ResponseEntity.notFound().build();
            }

            ApplyHomeData applyHomeData = applyHomeDataOpt.get();
            List<String> s3PdfUrls = applyHomeData.getS3PdfUrls();

            if (s3PdfUrls == null || s3PdfUrls.isEmpty()) {
                log.warn("s3_pdf_urls가 비어있음 - ID: {}", applyHomeId);
                return ResponseEntity.notFound().build();
            }

            // 첫 번째 PDF URL 사용
            String pdfUrl = s3PdfUrls.get(0);
            log.info("PDF URL 발견 - URL: {}, 사용자: {}", pdfUrl, userId);

            // URL에서 object key 추출
            String objectKey = extractObjectKeyFromUrl(pdfUrl);
            if (objectKey == null) {
                log.warn("URL에서 object key를 추출할 수 없음 - URL: {}", pdfUrl);
                return ResponseEntity.notFound().build();
            }

            // S3에서 파일 다운로드
            InputStream inputStream = s3StorageService.downloadFile(objectKey);
            byte[] fileContent = inputStream.readAllBytes();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", getFileNameFromObjectKey(objectKey));
            headers.setContentLength(fileContent.length);

            log.info("PDF 강제 다운로드 성공 - 파일명: {}, 사용자: {}", getFileNameFromObjectKey(objectKey), userId);
            return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

        } catch (Exception e) {
            log.error("MongoDB s3_pdf_urls를 통한 PDF 강제 다운로드 실패 - ID: {}, 오류: {}", applyHomeId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * S3 URL에서 object key 추출
     */
    private String extractObjectKeyFromUrl(String url) {
        try {
            // URL 형식: https://hana-homeplanner.s3.ap-northeast-2.amazonaws.com/pdfs/2025000387_2025000387_1.pdf
            String bucketPrefix = ".s3.ap-northeast-2.amazonaws.com/";
            int bucketIndex = url.indexOf(bucketPrefix);
            if (bucketIndex == -1) {
                return null;
            }
            
            return url.substring(bucketIndex + bucketPrefix.length());
        } catch (Exception e) {
            log.error("URL에서 object key 추출 실패 - URL: {}, 오류: {}", url, e.getMessage());
            return null;
        }
    }

    /**
     * 객체 키에서 파일명 추출
     */
    private String getFileNameFromObjectKey(String objectKey) {
        int lastSlashIndex = objectKey.lastIndexOf('/');
        return lastSlashIndex >= 0 ? objectKey.substring(lastSlashIndex + 1) : objectKey;
    }

    /**
     * JWT 토큰에서 사용자 ID 추출
     */
    private String extractUserIdFromToken(String authorization) {
        try {
            String jwtToken = authorization.replace("Bearer ", "");
            String userIdStr = jwtUtil.getUserIdFromToken(jwtToken);
            
            if (userIdStr == null) {
                return null;
            }
            
            return userIdStr;
        } catch (Exception e) {
            log.error("JWT 토큰에서 사용자 ID 추출 실패", e);
            return null;
        }
    }
}
