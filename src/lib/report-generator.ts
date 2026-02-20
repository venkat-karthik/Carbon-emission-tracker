/**
 * Report Generator
 * Generates PDF reports, CSV exports, and QR codes
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { iotManager } from './iot-sensors';
import { csvProcessor } from './csv-processor';

export interface ReportConfig {
  zone: string;
  dateRange: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeRawData: boolean;
}

export interface ReportData {
  zone: string;
  dateRange: string;
  generatedDate: string;
  greenIndexScore: number;
  scoreChange: number;
  monthlySavings: number;
  co2Reduced: number;
  categoryScores: {
    energy: number;
    water: number;
    waste: number;
    transport: number;
  };
  topIssues: Array<{
    title: string;
    impact: string;
    zone: string;
  }>;
  actions: {
    completed: number;
    inProgress: number;
    pending: number;
  };
}

class ReportGenerator {
  /**
   * Generate PDF Report
   */
  async generatePDF(config: ReportConfig): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Get report data
    const data = this.getReportData(config);
    
    // Header
    doc.setFillColor(34, 197, 94); // Green
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('GreenIndex Report', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(data.zone, 20, 33);
    
    // Green Index Score (large circle)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(48);
    doc.setFont('helvetica', 'bold');
    doc.text(data.greenIndexScore.toString(), pageWidth - 60, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Green Index', pageWidth - 60, 37, { align: 'center' });
    
    // Report Info
    let yPos = 55;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${data.generatedDate}`, 20, yPos);
    doc.text(`Period: ${data.dateRange}`, 20, yPos + 5);
    
    // Key Metrics
    yPos += 20;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Metrics', 20, yPos);
    
    yPos += 10;
    const metrics = [
      { label: 'Score Change', value: `${data.scoreChange > 0 ? '+' : ''}${data.scoreChange} pts`, color: data.scoreChange > 0 ? [34, 197, 94] : [239, 68, 68] },
      { label: 'Monthly Savings', value: `₹${data.monthlySavings.toLocaleString()}`, color: [34, 197, 94] },
      { label: 'CO₂ Reduced', value: `${data.co2Reduced} kg`, color: [59, 130, 246] },
    ];
    
    metrics.forEach((metric, index) => {
      const xPos = 20 + (index * 60);
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(xPos, yPos, 55, 25, 3, 3, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
      doc.text(metric.value, xPos + 27.5, yPos + 12, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(metric.label, xPos + 27.5, yPos + 20, { align: 'center' });
    });
    
    // Category Scores
    yPos += 35;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Category Scores', 20, yPos);
    
    yPos += 5;
    const categories = [
      { name: 'Energy', score: data.categoryScores.energy, color: [234, 179, 8] },
      { name: 'Water', score: data.categoryScores.water, color: [59, 130, 246] },
      { name: 'Waste', score: data.categoryScores.waste, color: [34, 197, 94] },
      { name: 'Transport', score: data.categoryScores.transport, color: [249, 115, 22] },
    ];
    
    categories.forEach((cat, index) => {
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(cat.name, 20, yPos);
      
      // Progress bar
      const barWidth = 120;
      const barHeight = 6;
      const barX = 60;
      
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(barX, yPos - 4, barWidth, barHeight, 2, 2, 'F');
      
      doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
      doc.roundedRect(barX, yPos - 4, (barWidth * cat.score) / 100, barHeight, 2, 2, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text(cat.score.toString(), barX + barWidth + 5, yPos);
    });
    
    // Top Issues
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Top Issues Identified', 20, yPos);
    
    yPos += 5;
    autoTable(doc, {
      startY: yPos,
      head: [['Issue', 'Impact', 'Zone']],
      body: data.topIssues.map(issue => [issue.title, issue.impact, issue.zone]),
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });
    
    // Actions Tracker
    yPos = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Actions Tracker', 20, yPos);
    
    yPos += 10;
    const actions = [
      { label: 'Completed', value: data.actions.completed, color: [34, 197, 94] },
      { label: 'In Progress', value: data.actions.inProgress, color: [234, 179, 8] },
      { label: 'Pending', value: data.actions.pending, color: [239, 68, 68] },
    ];
    
    actions.forEach((action, index) => {
      const xPos = 20 + (index * 60);
      doc.setFillColor(action.color[0], action.color[1], action.color[2], 0.1);
      doc.roundedRect(xPos, yPos, 55, 20, 3, 3, 'F');
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(action.color[0], action.color[1], action.color[2]);
      doc.text(action.value.toString(), xPos + 27.5, yPos + 10, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(action.label, xPos + 27.5, yPos + 16, { align: 'center' });
    });
    
    // Recommendations (if included)
    if (config.includeRecommendations) {
      yPos += 30;
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Recommendations', 20, yPos);
      
      yPos += 10;
      const recommendations = [
        '• Install LED lighting in high-usage areas to reduce energy consumption by 40%',
        '• Implement rainwater harvesting system for ₹95,000 with 14-month payback',
        '• Add 50 kW solar panels on Block B rooftop to save ₹12,500/month',
        '• Set up composting program to reduce waste disposal costs by 30%',
        '• Install EV charging stations to encourage green transportation',
      ];
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      recommendations.forEach(rec => {
        doc.text(rec, 20, yPos, { maxWidth: pageWidth - 40 });
        yPos += 8;
      });
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('GreenIndex Campus Sustainability OS', pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text('sustainability@campus.edu', pageWidth / 2, pageHeight - 6, { align: 'center' });
    
    // Save PDF
    doc.save(`GreenIndex-Report-${config.zone.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
  }
  
  /**
   * Generate CSV Export
   */
  generateCSV(config: ReportConfig): void {
    const data = this.getReportData(config);
    
    const csvLines = [
      'GreenIndex Report',
      `Zone,${data.zone}`,
      `Date Range,${data.dateRange}`,
      `Generated,${data.generatedDate}`,
      '',
      'Key Metrics',
      'Metric,Value',
      `Green Index Score,${data.greenIndexScore}`,
      `Score Change,${data.scoreChange}`,
      `Monthly Savings,₹${data.monthlySavings}`,
      `CO₂ Reduced,${data.co2Reduced} kg`,
      '',
      'Category Scores',
      'Category,Score',
      `Energy,${data.categoryScores.energy}`,
      `Water,${data.categoryScores.water}`,
      `Waste,${data.categoryScores.waste}`,
      `Transport,${data.categoryScores.transport}`,
      '',
      'Top Issues',
      'Issue,Impact,Zone',
      ...data.topIssues.map(issue => `"${issue.title}",${issue.impact},${issue.zone}`),
      '',
      'Actions Tracker',
      'Status,Count',
      `Completed,${data.actions.completed}`,
      `In Progress,${data.actions.inProgress}`,
      `Pending,${data.actions.pending}`,
    ];
    
    // Add raw data if included
    if (config.includeRawData) {
      csvLines.push('', 'Raw Sensor Data');
      const csvData = csvProcessor.exportToCSV();
      if (csvData) {
        csvLines.push(csvData);
      }
    }
    
    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GreenIndex-Report-${config.zone.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  /**
   * Generate QR Code for Sharing
   */
  async generateQRCode(config: ReportConfig): Promise<string> {
    const data = this.getReportData(config);
    
    // Create shareable URL (in production, this would be a real URL)
    const shareData = {
      zone: data.zone,
      score: data.greenIndexScore,
      dateRange: data.dateRange,
      url: `${window.location.origin}/reports?zone=${encodeURIComponent(data.zone)}`,
    };
    
    const qrData = JSON.stringify(shareData);
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }
  
  /**
   * Get report data
   */
  private getReportData(config: ReportConfig): ReportData {
    const metrics = iotManager.getTotalCampusMetrics();
    const stats = csvProcessor.getStatistics();
    
    return {
      zone: config.zone,
      dateRange: config.dateRange,
      generatedDate: new Date().toLocaleString(),
      greenIndexScore: 73,
      scoreChange: 3.4,
      monthlySavings: 42800,
      co2Reduced: 847,
      categoryScores: {
        energy: iotManager.getCategoryScore('energy'),
        water: iotManager.getCategoryScore('water'),
        waste: iotManager.getCategoryScore('waste'),
        transport: iotManager.getCategoryScore('transport'),
      },
      topIssues: [
        { title: 'Block B peak usage +18%', impact: '-6 pts', zone: 'Block B' },
        { title: 'Waste segregation missing in Hostel 2', impact: '-4 pts', zone: 'Hostel Zone' },
        { title: 'Water leak suspected in Lab Block', impact: '-3 pts', zone: 'Lab Block' },
      ],
      actions: {
        completed: 3,
        inProgress: 7,
        pending: 4,
      },
    };
  }
}

export const reportGenerator = new ReportGenerator();
export default reportGenerator;
