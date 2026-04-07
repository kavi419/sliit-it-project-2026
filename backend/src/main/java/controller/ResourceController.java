package controller;

import com.smartcampus.Resource;
import service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    // 1. GET - සියලුම රිසෝස් ලබා ගැනීම
    @GetMapping
    public List<Resource> getAllResources() {
        return resourceService.getAllResources();
    }

    // 2. POST - අලුත් රිසෝස් එකක් ඇතුළත් කිරීම
    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceService.saveResource(resource);
    }

    // 3. PUT - තියෙන රිසෝස් එකක විස්තර වෙනස් කිරීම
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        Resource updatedResource = resourceService.updateResource(id, resourceDetails);
        if (updatedResource != null) {
            return ResponseEntity.ok(updatedResource);
        }
        return ResponseEntity.notFound().build(); // ID එක හොයාගන්න බැරි නම් 404 Error එකක් දෙනවා
    }

    // 4. DELETE - රිසෝස් එකක් මකා දැමීම
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build(); // මකලා ඉවර වුණාම 204 Status එක දෙනවා
    }
}