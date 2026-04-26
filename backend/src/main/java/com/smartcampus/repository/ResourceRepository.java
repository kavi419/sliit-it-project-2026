package com.smartcampus.repository;

import com.smartcampus.model.ResourceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResourceRepository extends JpaRepository<ResourceEntity, Long>, JpaSpecificationExecutor<ResourceEntity> {

	Optional<ResourceEntity> findByNameIgnoreCase(String name);
}