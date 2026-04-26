package com.springboot.smartcampus.service;

import com.springboot.smartcampus.dto.ResourceRequest;
import com.springboot.smartcampus.dto.ResourceResponse;
import com.springboot.smartcampus.enums.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResourceService {
    Page<ResourceResponse> searchResources(String query, String type, Integer minCapacity, Integer maxCapacity, String location, ResourceStatus status, Pageable pageable);
    ResourceResponse getResource(Long id);
    ResourceResponse createResource(ResourceRequest request);
    ResourceResponse updateResource(Long id, ResourceRequest request);
    ResourceResponse updateStatus(Long id, ResourceStatus status);
    void deleteResource(Long id);
}
