package service;

import com.smartcampus.Resource;
import repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    // 1. සියල්ල ලබා ගැනීම (GET සඳහා)
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // 2. අලුත් එකක් සේව් කිරීම (POST සඳහා)
    public Resource saveResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // 3. රිසෝස් එකක් මකා දැමීම (DELETE සඳහා)
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    // 4. තියෙන රිසෝස් එකක් අප්ඩේට් කිරීම (PUT සඳහා)
    public Resource updateResource(Long id, Resource newResourceData) {
        // මුලින්ම අදාල ID එක තියෙනවද කියලා ඩේටාබේස් එකෙන් හොයනවා
        Optional<Resource> existingResource = resourceRepository.findById(id);
        
        if (existingResource.isPresent()) {
            Resource resource = existingResource.get();
            // පරණ ඩේටා මකලා අලුත් ඩේටා දානවා
            resource.setName(newResourceData.getName());
            resource.setType(newResourceData.getType());
            resource.setCapacity(newResourceData.getCapacity());
            resource.setLocation(newResourceData.getLocation());
            resource.setStatus(newResourceData.getStatus()); // ACTIVE හෝ OUT_OF_SERVICE
            
            return resourceRepository.save(resource); // අප්ඩේට් කරපු එක සේව් කරනවා
        }
        return null; 
    }
}