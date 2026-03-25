package com.redrive.adminpanel.service;

import com.redrive.adminpanel.dto.AdminLogResponse;
import com.redrive.adminpanel.dto.DashboardSummaryResponse;
import com.redrive.adminpanel.dto.MonthlySalesPoint;
import com.redrive.adminpanel.dto.SalesReportResponse;
import com.redrive.adminpanel.entity.Transaction;
import com.redrive.adminpanel.entity.enums.CarStatus;
import com.redrive.adminpanel.entity.enums.Role;
import com.redrive.adminpanel.entity.enums.TransactionStatus;
import com.redrive.adminpanel.repository.AdminLogRepository;
import com.redrive.adminpanel.repository.CarRepository;
import com.redrive.adminpanel.repository.TransactionRepository;
import com.redrive.adminpanel.repository.UserRepository;
import com.redrive.adminpanel.service.admin.Admin;
import com.redrive.adminpanel.service.mapper.AdminMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportingService extends BaseAdminService {

    private final CarRepository carRepository;
    private final TransactionRepository transactionRepository;

    public ReportingService(UserRepository userRepository,
                            AdminLogRepository adminLogRepository,
                            CarRepository carRepository,
                            TransactionRepository transactionRepository) {
        super(userRepository, adminLogRepository);
        this.carRepository = carRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public DashboardSummaryResponse getDashboardSummary(Long adminId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        long totalUsers = userRepository.count();
        long totalAdmins = userRepository.countByRoleIn(List.of(Role.ADMIN, Role.SUPER_ADMIN));
        long activeListings = carRepository.countByStatus(CarStatus.ACTIVE);
        long pendingListings = carRepository.countByStatus(CarStatus.PENDING_APPROVAL);
        long rejectedListings = carRepository.countByStatus(CarStatus.REJECTED);
        long totalTransactions = transactionRepository.count();
        long completedTransactions = transactionRepository.countByStatus(TransactionStatus.COMPLETED);
        BigDecimal totalRevenue = transactionRepository.sumAmountByStatus(TransactionStatus.COMPLETED);

        saveLog(adminActor.getUser(), "VIEW_DASHBOARD", "SUMMARY", "SUCCESS", startTime);

        return new DashboardSummaryResponse(
                totalUsers,
                totalAdmins,
                activeListings,
                pendingListings,
                rejectedListings,
                totalTransactions,
                completedTransactions,
                totalRevenue == null ? BigDecimal.ZERO : totalRevenue
        );
    }

    @Transactional
    public SalesReportResponse getSalesReport(Long adminId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        List<Transaction> completedTransactions = transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .filter(transaction -> transaction.getStatus() == TransactionStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = completedTransactions.stream()
                .map(Transaction::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        Map<YearMonth, List<Transaction>> transactionsByMonth = completedTransactions.stream()
                .collect(Collectors.groupingBy(transaction -> YearMonth.from(transaction.getCreatedAt())));

        List<MonthlySalesPoint> monthlySales = transactionsByMonth.entrySet()
                .stream()
                .sorted(Map.Entry.comparingByKey(Comparator.naturalOrder()))
                .map(entry -> new MonthlySalesPoint(
                        entry.getKey().format(formatter),
                        entry.getValue().size(),
                        entry.getValue().stream()
                                .map(Transaction::getAmountPaid)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                ))
                .toList();

        saveLog(adminActor.getUser(), "VIEW_SALES_REPORT", "SALES REPORT", "SUCCESS", startTime);

        return new SalesReportResponse(
                completedTransactions.size(),
                totalRevenue,
                monthlySales
        );
    }

    @Transactional
    public List<AdminLogResponse> getAdminLogs(Long adminId) {
        long startTime = System.currentTimeMillis();
        Admin adminActor = getAdminActor(adminId);

        List<AdminLogResponse> logs = adminLogRepository.findTop100ByOrderByCreatedAtDesc()
                .stream()
                .map(AdminMapper::toAdminLogResponse)
                .toList();

        saveLog(adminActor.getUser(), "VIEW_LOGS", "ADMIN LOGS", "SUCCESS", startTime);
        return logs;
    }
}
