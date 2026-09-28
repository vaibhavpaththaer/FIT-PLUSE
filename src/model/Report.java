package model;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

/**
 * Entity representing an Activity / Progress Report snapshot.
 * Maps to the `reports` MySQL table.
 */
public class Report implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private int userId;
    private String reportType = "monthly_performance";
    private Date dateRangeStart;
    private Date dateRangeEnd;
    private String summaryJson;
    private Timestamp generatedAt;

    public Report() {}

    public Report(int userId, String reportType, Date dateRangeStart, Date dateRangeEnd, String summaryJson) {
        this.userId = userId;
        this.reportType = reportType;
        this.dateRangeStart = dateRangeStart;
        this.dateRangeEnd = dateRangeEnd;
        this.summaryJson = summaryJson;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public Date getDateRangeStart() { return dateRangeStart; }
    public void setDateRangeStart(Date dateRangeStart) { this.dateRangeStart = dateRangeStart; }

    public Date getDateRangeEnd() { return dateRangeEnd; }
    public void setDateRangeEnd(Date dateRangeEnd) { this.dateRangeEnd = dateRangeEnd; }

    public String getSummaryJson() { return summaryJson; }
    public void setSummaryJson(String summaryJson) { this.summaryJson = summaryJson; }

    public Timestamp getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Timestamp generatedAt) { this.generatedAt = generatedAt; }
}
