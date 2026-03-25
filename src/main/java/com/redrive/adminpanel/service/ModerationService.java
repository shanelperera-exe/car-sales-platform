package com.redrive.adminpanel.service;

import com.redrive.adminpanel.dto.BanUserRequest;
import com.redrive.adminpanel.dto.CarListingResponse;
import com.redrive.adminpanel.dto.ListingDecisionRequest;
import com.redrive.adminpanel.dto.UserManagementResponse;
import com.redrive.adminpanel.entity.Car;
import com.redrive.adminpanel.entity.User;
import com.redrive.adminpanel.entity.enums.CarStatus;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.entity.enums.UserStatus;
import com.redrive.adminpanel.exception.BadRequestException;
import com.redrive.adminpanel.exception.ResourceNotFoundException;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.CarRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.admin.Admin;
import com.redrive.adminpanel.service.mapper.AdminMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

@Service
public class ModerationService extends BaseAdminService {

    private final CarRepository carRepository;

    public ModerationService(UserRepository userRepository,
                             AdminLogRepository adminLogRepository,
                             CarRepository carRepository) {
        super(userRepository, adminLogRepository);
        this.carRepository = carRepository;
    }

    @Transactional
    public List<CarListingResponse> getPendingListings(Long adminId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        List<CarListingResponse> listings = carRepository.findByStatusOrderByCreatedAtDesc(CarStatus.PENDING_APPROVAL)
                .stream()
                .map(AdminMapper::toCarListingResponse)
                .toList();

        saveLog(adminActor.getUser(), "VIEW_PENDING_LISTINGS", "PENDING APPROVAL QUEUE", "SUCCESS", startTime);
        return listings;
    }

    @Transactional
    public List<CarListingResponse> getListings(Long adminId, CarStatus status) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        Stream<Car> stream = status == null
                ? carRepository.findAllByOrderByCreatedAtDesc().stream()
                : carRepository.findByStatusOrderByCreatedAtDesc(status).stream();

        List<CarListingResponse> response = stream
                .map(AdminMapper::toCarListingResponse)
                .toList();

        saveLog(adminActor.getUser(), "VIEW_LISTINGS", status == null ? "ALL LISTINGS" : status.name(), "SUCCESS", startTime);
        return response;
    }

    @Transactional
    public CarListingResponse approveListing(Long adminId, Long carId, ListingDecisionRequest request) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        Car car = getCar(carId);

        if (car.getStatus() == CarStatus.SOLD) {
            saveLog(adminActor.getUser(), "APPROVE_LISTING", "Car ID: " + carId, "FAILED", startTime);
            throw new BadRequestException("A sold car cannot be sent back to active status.");
        }

        car.setStatus(CarStatus.ACTIVE);
        car.setModerationNote(cleanMessage(request == null ? null : request.moderationNote()));

        Car savedCar = carRepository.save(car);
        saveLog(adminActor.getUser(), "APPROVE_LISTING", "Car ID: " + carId, "SUCCESS", startTime);
        return AdminMapper.toCarListingResponse(savedCar);
    }

    @Transactional
    public CarListingResponse rejectListing(Long adminId, Long carId, ListingDecisionRequest request) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        Car car = getCar(carId);

        if (car.getStatus() == CarStatus.SOLD) {
            saveLog(adminActor.getUser(), "REJECT_LISTING", "Car ID: " + carId, "FAILED", startTime);
            throw new BadRequestException("A sold car cannot be rejected.");
        }

        car.setStatus(CarStatus.REJECTED);
        car.setModerationNote(cleanMessage(request == null ? null : request.moderationNote()));

        Car savedCar = carRepository.save(car);
        saveLog(adminActor.getUser(), "REJECT_LISTING", "Car ID: " + carId, "SUCCESS", startTime);
        return AdminMapper.toCarListingResponse(savedCar);
    }

    @Transactional
    public List<UserManagementResponse> getUsers(Long adminId, Role role, UserStatus accountStatus) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        Stream<User> stream = userRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(user -> !user.isAdminAccount());

        if (role != null) {
            stream = stream.filter(user -> user.getRole() == role);
        }
        if (accountStatus != null) {
            stream = stream.filter(user -> user.getAccountStatus() == accountStatus);
        }

        List<UserManagementResponse> response = stream
                .map(AdminMapper::toUserManagementResponse)
                .toList();

        saveLog(adminActor.getUser(), "VIEW_USERS", "USER MANAGEMENT", "SUCCESS", startTime);
        return response;
    }

    @Transactional
    public UserManagementResponse getUserById(Long adminId, Long userId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        User user = getUser(userId);

        if (user.isAdminAccount()) {
            throw new BadRequestException("Use the admin accounts endpoint to view admin users.");
        }

        saveLog(adminActor.getUser(), "VIEW_USER", "User ID: " + userId, "SUCCESS", startTime);
        return AdminMapper.toUserManagementResponse(user);
    }

    @Transactional
    public UserManagementResponse banUser(Long adminId, Long userId, BanUserRequest request) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        User user = getUser(userId);

        if (user.isAdminAccount()) {
            saveLog(adminActor.getUser(), "BAN_USER", "User ID: " + userId, "FAILED", startTime);
            throw new BadRequestException("Admin accounts cannot be banned from this endpoint.");
        }

        user.setAccountStatus(UserStatus.BANNED);
        userRepository.save(user);
        saveLog(adminActor.getUser(), "BAN_USER", "User ID: " + userId + " | " + request.reason(), "SUCCESS", startTime);

        return AdminMapper.toUserManagementResponse(user);
    }

    @Transactional
    public UserManagementResponse unbanUser(Long adminId, Long userId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);
        requirePlatformOverridePermission(adminActor);

        User user = getUser(userId);
        if (user.isAdminAccount()) {
            saveLog(adminActor.getUser(), "UNBAN_USER", "User ID: " + userId, "FAILED", startTime);
            throw new BadRequestException("Admin accounts cannot be changed from this endpoint.");
        }

        user.setAccountStatus(UserStatus.ACTIVE);
        userRepository.save(user);
        saveLog(adminActor.getUser(), "UNBAN_USER", "User ID: " + userId, "SUCCESS", startTime);

        return AdminMapper.toUserManagementResponse(user);
    }

    private Car getCar(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new ResourceNotFoundException("Car listing not found."));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    private String cleanMessage(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
