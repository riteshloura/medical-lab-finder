package com.lablocator.service;

import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.dto.lab.GetNearbyLabsResponse;
import com.lablocator.model.Lab;
import com.lablocator.model.User;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.UserRepo;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class LabService {
    @Autowired
    private LabRepo labRepo;
    @Autowired
    private UserRepo userRepo;


    public List<GetNearbyLabsResponse> getNearbyLabs(double lat, double lng, double radius) {
        List<Lab> labs=  labRepo.findNearbyLabs(lat, lng,  radius);
        List<GetNearbyLabsResponse> res = new ArrayList<>();

        for(Lab lab:labs){
            res.add(new GetNearbyLabsResponse(
                    lab.getName(),
                    lab.getDescription(),
                    lab.getAddress(),
                    lab.getCity(),
                    lab.getState(),
                    lab.getContactNumber(),
                    lab.getId(),
                    lab.getLatitude(),
                    lab.getLongitude(),
                    lab.getSlotCapacityOnline()
            ));
        }

        return res;
    }

    public Lab getLabById(Long id) {
        return labRepo.findById(id).orElse(null);
    }

    public List<Lab> getOwnerLabs(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return labRepo.findAllByOwnerId(user.getId());
    }

    public List<Lab> getLabsByTestAndLocation(String test, String location) {
        return labRepo.findByLabTests_Test_NameContainingIgnoreCaseAndCityContainingIgnoreCase(test, location);
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

    public ResponseEntity<?> updateLab(Long labId, CreateLabRequest lab, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Lab labEntity = labRepo.findById(labId)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        if (!labEntity.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You are not allowed to update this lab");
        }

        labEntity.setName(lab.name());
        labEntity.setDescription(lab.description());
        labEntity.setAddress(lab.address());
        labEntity.setCity(lab.city());
        labEntity.setState(lab.state());
        labEntity.setContactNumber(lab.contactNumber());
        labEntity.setLongitude(lab.longitude());
        labEntity.setLatitude(lab.latitude());
        labEntity.setSlotCapacityOnline(lab.slotCapacityOnline());

        return ResponseEntity.ok(labRepo.save(labEntity));
    }
}
