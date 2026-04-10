package com.lablocator.service;

import com.lablocator.dto.lab.CreateLabRequest;
import com.lablocator.dto.lab.GetFilterLabsResponse;
import com.lablocator.dto.lab.GetNearbyLabsResponse;
import com.lablocator.dto.lab.GetOwnersLabResponse;
import com.lablocator.exceptions.AccessDeniedException;
import com.lablocator.exceptions.ResourceNotFoundException;
import com.lablocator.model.Lab;
import com.lablocator.model.LabSlot;
import com.lablocator.model.User;
import com.lablocator.projection.NearbyLabProjection;
import com.lablocator.repository.LabRepo;
import com.lablocator.repository.LabSlotRepo;
import com.lablocator.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class LabService {
    @Autowired private LabRepo labRepo;
    @Autowired private UserRepo userRepo;
    @Autowired private LabSlotRepo labSlotRepo;

    public LabSlot getOrCreateSlot(Lab lab, LocalDate date) {
//        LocalDate today = LocalDate.now();
        LabSlot slot = labSlotRepo.findSlotByLabAndDate(lab, date);
        if (slot == null) {
            slot = LabSlot.builder()
                    .lab(lab)
                    .date(date)
                    .totalSlots(lab.getSlotCapacityOnline())
                    .bookedSlots(0)
                    .build();

            labSlotRepo.save(slot);
        }
        return slot;
    }

    public int getAvailableSlots(LabSlot slot) {
        return slot.getTotalSlots() - slot.getBookedSlots();
    }

    public List<GetNearbyLabsResponse> getNearbyLabs(double lat, double lng, double radius) {
        List<NearbyLabProjection> labs = labRepo.findNearbyLabs(lat, lng, radius);

        LocalDate today = LocalDate.now();
        List<GetNearbyLabsResponse> res = new ArrayList<>();
        for (NearbyLabProjection lab : labs) {
            Lab oneLab = labRepo.findById(lab.getId()).orElse(null);
            LabSlot slot = getOrCreateSlot(oneLab, today);

            res.add(new GetNearbyLabsResponse(
                    lab.getName(), lab.getDescription(), lab.getAddress(),
                    lab.getCity(), lab.getState(), lab.getContactNumber(),
                    lab.getId(), lab.getLatitude(), lab.getLongitude(),
                    getAvailableSlots(slot),
                    lab.getOpeningTime(), lab.getClosingTime(),
                    lab.getTotalReviews(), lab.getAvgRating(),
                    Math.round(lab.getDistance() * 100.0) / 100.0
            ));
        }
        return res;
    }

    public GetFilterLabsResponse getLabById(Long id) {
        Lab lab = labRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", id));

        LocalDate today = LocalDate.now();
        LabSlot slot = getOrCreateSlot(lab, today);

        return new GetFilterLabsResponse(
                lab.getName(), lab.getDescription(), lab.getAddress(),
                lab.getCity(), lab.getState(), lab.getContactNumber(),
                lab.getId(), lab.getLatitude(), lab.getLongitude(),
                getAvailableSlots(slot), lab.getOpeningTime(), lab.getClosingTime(),
                lab.getTotalReviews(), lab.getAvgRating()
        );
    }

    public List<GetOwnersLabResponse> getOwnerLabs(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate today = LocalDate.now();
        List<GetOwnersLabResponse> res = new ArrayList<>();
        for (Lab lab : labRepo.findAllByOwnerId(user.getId())) {
            LabSlot slot = getOrCreateSlot(lab, today);

            res.add(new GetOwnersLabResponse(
                    lab.getId(), lab.getName(), lab.getDescription(), lab.getAddress(),
                    lab.getCity(), lab.getState(), lab.getLongitude(), lab.getLatitude(),
                    lab.getContactNumber(), getAvailableSlots(slot),
                    lab.getTotalReviews(), lab.getAvgRating(), lab.getCreatedAt(),
                    lab.getOpeningTime(), lab.getClosingTime()
            ));
        }
        return res;
    }

    public List<GetFilterLabsResponse> getLabsByTestAndLocation(String test, String location) {
        List<Lab> labs = labRepo.findByLabTests_Test_NameContainingIgnoreCaseAndCityContainingIgnoreCase(test, location);

        LocalDate today = LocalDate.now();
        List<GetFilterLabsResponse> res = new ArrayList<>();

        for (Lab lab : labs) {
            LabSlot slot = getOrCreateSlot(lab, today);

            res.add(new GetFilterLabsResponse(
                    lab.getName(), lab.getDescription(), lab.getAddress(),
                    lab.getCity(), lab.getState(), lab.getContactNumber(),
                    lab.getId(), lab.getLatitude(), lab.getLongitude(),
                    getAvailableSlots(slot), lab.getOpeningTime(), lab.getClosingTime(),
                    lab.getTotalReviews(), lab.getAvgRating()
            ));
        }
        return res;
    }

    public ResponseEntity<?> createLab(CreateLabRequest lab, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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
        labEntity.setOpeningTime(lab.openingTime());
        labEntity.setClosingTime(lab.closingTime());

        return ResponseEntity.ok(labRepo.save(labEntity));
    }

    public ResponseEntity<?> updateLab(Long labId, CreateLabRequest lab, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab labEntity = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (!labEntity.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorised to update this lab");
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
        labEntity.setOpeningTime(lab.openingTime());
        labEntity.setClosingTime(lab.closingTime());

        return ResponseEntity.ok(labRepo.save(labEntity));
    }

    public ResponseEntity<?> deleteLab(Long labId, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Lab labEntity = labRepo.findById(labId)
                .orElseThrow(() -> new ResourceNotFoundException("Lab", labId));

        if (!labEntity.getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorised to delete this lab");
        }

        labRepo.delete(labEntity);
        return ResponseEntity.ok("Lab deleted successfully");
    }
}

