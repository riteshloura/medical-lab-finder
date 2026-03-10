package com.lablocator.service;

import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.model.Lab;
import com.lablocator.model.User;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LabService {
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private UserRepo userRepo;


    public List<Lab> getAllLabs() {
        return labRepo.findAll();
    }

    public Lab getLabById(Long id) {
        return labRepo.findById(id).orElse(null);
    }

    public List<Lab> getLabsByCity(String city) {
        return labRepo.findByCityIgnoreCase(city);
    }

    public ResponseEntity<?> createLab(CreateLabRequest lab, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));;

        Lab labEntity = new Lab();
        labEntity.setName(lab.name());
        labEntity.setDescription(lab.description());
        labEntity.setAddress(lab.address());
        labEntity.setCity(lab.city());
        labEntity.setState(lab.state());
        labEntity.setContactNumber(lab.contactNumber());
        labEntity.setLongitude(lab.longitude());
        labEntity.setLatitude(lab.latitude());
        labEntity.setSlotCapacityOnline(lab.slotCapacityOnline());

        labEntity.setOwner(user);

        labEntity = labRepo.save(labEntity);
        return ResponseEntity.ok().body(labEntity);
    }
}
