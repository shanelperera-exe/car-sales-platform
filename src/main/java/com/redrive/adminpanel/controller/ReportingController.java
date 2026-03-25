package com.redrive.adminpanel.controller;

import com.redrive.adminpanel.dto.AdminLogResponse;
import com.redrive.adminpanel.dto.DashboardSummaryResponse;
import com.redrive.adminpanel.dto.SalesReportResponse;
import com.redrive.adminpanel.service.ReportingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class ReportingController {

    private final ReportingService reportingService;

    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(@RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(reportingService.getDashboardSummary(adminId));
    }

    @GetMapping("/reports/sales")
    public ResponseEntity<SalesReportResponse> getSalesReport(@RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(reportingService.getSalesReport(adminId));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminLogResponse>> getAdminLogs(@RequestHeader("X-Admin-Id") Long adminId) {
        return ResponseEntity.ok(reportingService.getAdminLogs(adminId));
    }
}
